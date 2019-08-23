/* jshint esversion: 6 */
(function () {
    "use strict";
})();

let audio = {
    _audioContext: null,
    _oscillator: null,
    _gain: null,
    _running: false,
    start: function (volume, type, frequency) {
        console.log("Iniciando");
        this._audioContext = new AudioContext();
        this._oscillator = this._audioContext.createOscillator();
        this._gain = this._audioContext.createGain();

        this._gain.gain.value = volume;
        this._oscillator.type = type;
        this._oscillator.frequency.value = frequency;
        this._oscillator.connect(this._gain);
        this._gain.connect(this._audioContext.destination);
        this._oscillator.start(0);

        this._running = true;
        console.log("Iniciando");
    },
    stop: function () {
        console.log("Parando");
        this._oscillator.stop();
        if (this._audioContext.close) { // MS has not context.close
            this._audioContext.close();
        }

        this._gain = null;
        this._oscillator = null;
        this._audioContext = null;
        this._running = false;
        console.log("Parado");
    },
    get type() {
        return this._oscillator.type;
    },
    set type(type) {
        this._oscillator.type = type;
    },
    get frequency() {
        return this._oscillator.frequency.value;
    },
    set frequency(frequency) {
        this._oscillator.frequency.value = frequency;
    },
    get volume() {
        return this._gain.gain.value;
    },
    set volume(volume) {
        this._gain.gain.value = volume;
    },
    get running() {
        return this._running;
    }
};


function iniciarSom() {
    audio.start($("#gain").val(), $("#type").val(), $("#frequency").val());

    $("#btSound").text("Parar");
    $("#btnExibeIntervalos").prop("disabled", true);
}

function pararSom() {
    audio.stop();

    $("#btSound").text("Iniciar");
    $("#btnExibeIntervalos").prop("disabled", false);
}

/**
 * 
 * @param {JQuery} control 
 * @param {Event} event 
 * @param {number} decimais 
 */
function normalizarValor(event, decimais) {

    function valorInteiro(ctrl, delta, sentido) {
        let newVal = parseInt(ctrl.val()) + sentido * delta;
        return (newVal > 0) ? newVal : 0;
    }

    function valorDecimal(ctrl, delta, sentido) {
        let newVal = (Math.round((parseFloat(ctrl.val()) + sentido * delta) * 100) / 100).toFixed(decimais);

        if (newVal > parseFloat(ctrl.prop("max"))) {
            return ctrl.prop("max");
        } else if (newVal < 0) {
            return "0." + "0".repeat(decimais);
        } else if (Number.isInteger(newVal)) {
            return newVal + "." + "0".repeat(decimais);
        }
        return newVal;
    }

    let control = $(event.currentTarget);
    let step = decimais ? parseFloat(control.prop("step")) : parseInt(control.prop("step"));
    let delta = (event.ctrlKey ? 10 : 1) * step;
    let sentido = event.deltaY;
    let conversor = decimais ? valorDecimal : valorInteiro;
    let newVal = conversor(control, delta, sentido);
    console.debug(newVal);

    control.val(newVal).trigger("change");
    event.preventDefault();
}

function init() {
    $("#btSound").click(() => audio.running ? pararSom() : iniciarSom());
    $("#type").on('change', (event) => {
        if (audio.running) {
            audio.type = $(event.currentTarget).val();
        }
    }).focus();
    $("#frequency").on('change', (event) => {
        if (audio.running) {
            audio.frequency = $(event.currentTarget).val();
        }
    }).on('mousewheel', event => normalizarValor(event, 0));
    $("#gain").on('change', (event) => {
        if (audio.running) {
            audio.volume = $(event.currentTarget).val();
        }
    }).on('mousewheel', event => normalizarValor(event, 2));
    $("#tempoAtivo").on('change', (event) => {
        if (audio.running) {
            console.debug(event.currentTarget.id, $(event.currentTarget).val());
        }
    }).on('mousewheel', event => normalizarValor(event, 1));
    $("#tempoInativo").on('change', (event) => {
        if (audio.running) {
            console.debug(event.currentTarget.id, $(event.currentTarget).val());
        }
    }).on('mousewheel', event => normalizarValor(event, 1));

    console.info("Audio Pronto!");
}

$(document).ready(function () {
    if (!!AudioContext) {
        init();
    } else {
        $("form :input").prop("disabled", true);
        console.error("Não tem Audio!");
    }
});