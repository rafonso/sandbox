/* jshint esversion: 6 */
(function () {
    "use strict";
})();

let temIntervalos = false;

let audio = {
    _audioContext: null,
    _oscillator: null,
    _gain: null,
    _running: false,
    _tempoAtivo: NaN,
    _tempoInativo: NaN,
    start: function (volume, type, frequency, activeTime = NaN, inactiveTime = NaN) {
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

        this._tempoAtivo = activeTime;
        this._tempoInativo = inactiveTime;

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
    },
    get tempoAtivo() {
        return this._tempoAtivo;
    },
    set tempoAtivo(t) {
        this._tempoAtivo = t;
    },
    get tempoInativo() {
        return this._tempoInativo;
    },
    set tempoInativo(t) {
        this._tempoInativo = t;
    }
};


function iniciarSom() {
    audio.start(
        $("#gain").val(),
        $("#type").val(),
        $("#frequency").val(),
        temIntervalos ? $("#tempoAtivo").val() : NaN,
        temIntervalos ? $("#tempoInativo").val() : NaN
    );

    $("#btSound").text("Parar");
    $("#btnExibeIntervalos").prop("disabled", true);
}

function pararSom() {
    audio.stop();

    $("#btSound").text("Iniciar");
    $("#btnExibeIntervalos").prop("disabled", false);
}

function changeAudioProp(propriedade, event) {
    if (audio.running) {
        audio[propriedade] = $(event.currentTarget).val();
    }
}

/**
 * 
 * @param {JQuery} control 
 * @param {Event} event 
 * @param {number} decimais 
 */
function initInputNumber(idControl, propriedade, decimais) {
    let control = $("#" + idControl);

    function valorInteiro(delta, sentido) {
        let newVal = parseInt(control.val()) + sentido * delta;
        return (newVal > 0) ? newVal : 0;
    }

    function valorDecimal(delta, sentido) {
        let newVal = (Math.round((parseFloat(control.val()) + sentido * delta) * 100) / 100).toFixed(decimais);

        if (newVal > parseFloat(control.prop("max"))) {
            return control.prop("max");
        } else if (newVal < 0) {
            return "0." + "0".repeat(decimais);
        } else if (Number.isInteger(newVal)) {
            return newVal + "." + "0".repeat(decimais);
        }
        return newVal;
    }

    function onMouseWheel(event) {
        let step = decimais ? parseFloat(control.prop("step")) : parseInt(control.prop("step"));
        let delta = (event.ctrlKey ? 10 : 1) * step;
        let sentido = event.deltaY;
        let conversor = decimais ? valorDecimal : valorInteiro;
        let newVal = conversor(delta, sentido);
        console.debug(newVal);

        control.val(newVal).trigger("change");
        event.preventDefault();
    }

    control
        .on('change', (event) => changeAudioProp(propriedade, event))
        .on('mousewheel', event => onMouseWheel(event));
}

function init() {
    $("#btSound").click(() => audio.running ? pararSom() : iniciarSom());
    $("#type")
        .on('change', (event) => changeAudioProp("type", event))
        .focus();
    initInputNumber("frequency", "frequency", 0);
    initInputNumber("gain", "volume", 2);
    $("#btnExibeIntervalos").on('click', () => temIntervalos = !temIntervalos);
    initInputNumber("tempoAtivo", "tempoAtivo", 1);
    initInputNumber("tempoInativo", "tempoInativo", 1);

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