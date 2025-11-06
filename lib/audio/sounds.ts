/**
 * Utilidades para reproducir sonidos del sistema
 */

/**
 * Reproduce un sonido de éxito (asistencia aceptada)
 */
export function playSuccessSound() {
    try {
        // Crear un contexto de audio
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

        // Frecuencia y duración para un sonido agradable de éxito
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Sonido ascendente (más agradable)
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
        console.warn("No se pudo reproducir el sonido de éxito:", error);
    }
}

/**
 * Reproduce un sonido de error (asistencia denegada)
 */
export function playErrorSound() {
    try {
        // Crear un contexto de audio
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

        // Frecuencia y duración para un sonido de error
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Sonido descendente (más grave, indica error)
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.15);

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
        console.warn("No se pudo reproducir el sonido de error:", error);
    }
}

