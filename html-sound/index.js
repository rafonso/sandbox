/* jshint esversion: 6 */
(function () {
    "use strict";
})();

let audioContext;
let oscillator;
let gain;

function iniciarSom() {
    audioContext = new AudioContext();
    oscillator = audioContext.createOscillator();
    gain = audioContext.createGain();

    gain.gain.value = $("#gain").val();
    oscillator.type = $("#type").val();
    oscillator.frequency.value = $("#frequency").val();
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(0);

    $("#btSound").text("Parar");
    console.debug(audioContext);
}

function pararSom() {
    oscillator.stop();
    if (audioContext.close) { // MS has not context.close
        audioContext.close();
    }
    audioContext = null;
    oscillator = null;
    gain = null;

    $("#btSound").text("Iniciar");
    console.debug(audioContext);
}


$(document).ready(function () {
    if (!AudioContext) {
        console.error("Não tem Audio!");
        $("form :input").prop("disabled", true);
        return;
    }

    console.info("Audio Pronto!");

    $("#btSound").click(() => !!audioContext ? pararSom() : iniciarSom());
    $("#type").on('change', () => {
        if (!!audioContext) {
            oscillator.type = $("#type").val();
        }
    });
    $("#frequency").on('change', (event) => {
        if (!!audioContext) {
            oscillator.frequency.value = $("#frequency").val();
        }
    }).on('mousewheel', function (event) {
        let delta = event.ctrlKey ? 100 : 10;
        let newVal = parseInt($("#frequency").val()) + event.deltaY * delta;
        newVal = (newVal > 0) ? newVal : 0;
        $("#frequency").val(newVal).trigger("change");
        event.preventDefault();
    });
    $("#gain").on('change', (event) => {
        if (!!audioContext) {
            gain.gain.value = $("#gain").val();
        }
    }).on('mousewheel', function (event) {
        let delta = event.ctrlKey ? 0.10 : 0.01;
        let newVal = Math.round((parseFloat($("#gain").val()) + event.deltaY * delta) * 100) / 100;
        newVal = (newVal > 0) ?
            (/\d*\.\d\d$/.test(newVal) ? newVal : (newVal + '0')) :
            '0.00';
        $("#gain").val(newVal).trigger("change");
        event.preventDefault();
    });
});

// (Math.round($("#gain").val() * 100) / 100) + event.deltaY * delta