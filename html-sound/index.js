/* jshint esversion: 6 */
(function () {
    "use strict";
})();

let temIntervalos = false;

let audio = {
    _audioContext: null,
    _oscillator: null,
    _gain: null,
    _volume: 0,
    _running: false,
    _tempoAtivo: NaN,
    _tempoInativo: NaN,
    _ativo: false,
    start: function (volume, type, frequency, detune, activeTime = NaN, inactiveTime = NaN) {
        // console.debug("Iniciando");
        this._audioContext = new AudioContext();
        this._oscillator = this._audioContext.createOscillator();
        this._gain = this._audioContext.createGain();
        this._volume = volume;

        this._gain.gain.value = volume;
        this._oscillator.type = type;
        this._oscillator.frequency.value = frequency;
        this._oscillator.detune = detune;
        this._oscillator.connect(this._gain);
        this._gain.connect(this._audioContext.destination);
        this._oscillator.start();

        this._tempoAtivo = activeTime;
        this._tempoInativo = inactiveTime;

        this._running = true;
        this._ativo = true;
        // console.debug("Iniciado");
        if (!isNaN(this.tempoAtivo) && !isNaN(this.tempoInativo)) {
            // console.debug("start", this._volume);
            setTimeout(() => this._bipar(false), this.tempoAtivo * 1000);
        }
    },
    stop: function () {
        // console.debug("Parando");
        this._oscillator.stop();
        if (this._audioContext.close) { // MS has not context.close
            this._audioContext.close();
        }

        this._gain = null;
        this._oscillator = null;
        this._audioContext = null;
        this._running = false;
        this._ativo = false;
        // console.debug("Parado");
    },
    _bipar: function (ativar) {
        if (!this.running) {
            return;
        }

        let vol = ativar ? this.volume : 0;
        let time = ativar ? this.tempoAtivo : this.tempoInativo;

        this._gain.gain.value = vol;
        this._ativo = ativar;
        // console.debug("bipar", vol);
        setTimeout(() => this._bipar((this.tempoInativo > 0) ? !ativar : true), time * 1000);
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
    get detune() {
        return this._oscillator.detune;
    },
    set detune(value) {
        this._oscillator.detune.value = value;
    },
    get volume() {
        return this._volume;
    },
    set volume(volume) {
        this._volume = volume;
        if (this._ativo) {
            this._gain.gain.value = volume;
        }
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
        parseFloat($("#gain").val()).toFixed(2),
        $("#type").val(),
        $("#frequency").val(),
        $("#detune").val(),
        temIntervalos ? parseFloat($("#tempoAtivo").val()).toFixed(1) : NaN,
        temIntervalos ? parseFloat($("#tempoInativo").val()).toFixed(1) : NaN
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

function controlToValue(control, controlValue, decimais) {
    controlValue.text(parseFloat(control.val()).toFixed(decimais));
}

/**
 * 
 * @param {JQuery} control 
 * @param {Event} event 
 * @param {number} decimais 
 */
function initInputNumber(idControl, propriedade, decimais) {
    let control = $("#" + idControl);
    let controlValue = $("#" + idControl + "-value");
    controlToValue(control, controlValue, decimais);

    function changeNumericProperty(event) {
        controlToValue(control, controlValue, decimais);
        changeAudioProp(propriedade, event);
    }

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
        // console.debug(newVal);

        control.val(newVal).trigger("change");
        event.preventDefault();
    }

    function onMouseMouse(event) {
        if (event.which === 1) {
            changeNumericProperty(event);
        }
    }

    control
        .on('change', changeNumericProperty)
        .on('mousemove', onMouseMouse)
        .on('mousewheel', onMouseWheel);
}

function init() {
    $("#btSound").click(() => audio.running ? pararSom() : iniciarSom());
    $("#type")
        .on('change', (event) => changeAudioProp("type", event))
        .focus();
    initInputNumber("frequency", "frequency", 0);
    initInputNumber("gain", "volume", 2);
    initInputNumber("detune", "detune", 0);
    $("#controleIntervalos")
        .on("shown.bs.collapse", () => temIntervalos = true) 
        .on("hidden.bs.collapse", () => temIntervalos = false);
    initInputNumber("tempoAtivo", "tempoAtivo", 1);
    initInputNumber("tempoInativo", "tempoInativo", 1);

    // console.info("Audio Pronto!");
}

$(document).ready(function () {
    if (!!AudioContext) {
        init();
    } else {
        $("form :input").prop("disabled", true);
        console.error("Não tem Audio!");
    }
});