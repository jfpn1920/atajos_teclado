// ===== REFERENCIAS A LOS ELEMENTOS DEL HTML =====
const tarjetas = document.querySelectorAll('.tarjeta');            // las cinco tarjetas
const botonesSistema = document.querySelectorAll('[data-sistema]'); // Windows / Mac
const teclasModificadoras = document.querySelectorAll('[data-mod]'); // teclas "Ctrl"
const progreso = document.getElementById('progreso');
const btnReiniciar = document.getElementById('btnReiniciar');
// ===== CLAVE DE LOCALSTORAGE =====
const CLAVE = 'atajos_estado';
// ===== ESTADO POR DEFECTO =====
// sistema: windows o mac | aprendidos: ids dominados | veces: veces practicado por atajo
const estadoInicial = { sistema: 'windows', aprendidos: [], veces: {} };
// ===== LEER EL ESTADO GUARDADO =====
function leerEstado() {
    try {
        const guardado = localStorage.getItem(CLAVE);
        // Si hay datos guardados los usamos; si no, partimos del estado inicial
        return guardado ? { ...estadoInicial, ...JSON.parse(guardado) } : { ...estadoInicial };
    } catch (error) {
      return { ...estadoInicial }; // si algo falla, empezamos desde cero
    }
}
// Al cargar la página recuperamos todo lo guardado
let estado = leerEstado();
// ===== GUARDAR EL ESTADO =====
function guardarEstado() {
    localStorage.setItem(CLAVE, JSON.stringify(estado));
}
// ===== CAMBIAR EL SISTEMA (Windows o Mac) =====
function cambiarSistema(sistema) {
    estado.sistema = sistema;
    guardarEstado();
    dibujarPantalla();
}
// ===== MARCAR O DESMARCAR "YA LO DOMINO" =====
function alternarAprendido(id, marcado) {
    if (marcado) estado.aprendidos.push(id);                              // lo agregamos
    else estado.aprendidos = estado.aprendidos.filter(a => a !== id);     // lo quitamos
    guardarEstado();
    dibujarPantalla();
}
// ===== REGISTRAR QUE SE PRESIONÓ UN ATAJO =====
function registrarPractica(tarjeta) {
    const id = tarjeta.dataset.id;
    estado.veces[id] = (estado.veces[id] || 0) + 1;  // suma una vez más
    guardarEstado();
    dibujarPantalla();
    // Ilumina la tarjeta por medio segundo
    tarjeta.classList.add('pulsada');
    setTimeout(() => tarjeta.classList.remove('pulsada'), 500);
}
// ===== REINICIAR EL PROGRESO =====
function reiniciar() {
    if (!confirm('¿Seguro que quieres reiniciar tu progreso?')) return;
    estado = { ...estadoInicial, aprendidos: [], veces: {} };
    guardarEstado();
    dibujarPantalla();
}
// ===== ACTUALIZAR TODO LO QUE SE VE EN PANTALLA =====
function dibujarPantalla() {
    // Botones de sistema: marcamos el elegido
    botonesSistema.forEach(b => b.classList.toggle('activo', b.dataset.sistema === estado.sistema));
    // La tecla modificadora cambia según el sistema: Ctrl en Windows, ⌘ en Mac
    teclasModificadoras.forEach(k => { k.textContent = estado.sistema === 'mac' ? '⌘' : 'Ctrl'; });
    // Cada tarjeta: veces practicado y casilla de "ya lo domino"
    tarjetas.forEach(tarjeta => {
        const id = tarjeta.dataset.id;
        const dominado = estado.aprendidos.includes(id);
        tarjeta.classList.toggle('dominado', dominado);
        tarjeta.querySelector('.veces').textContent = estado.veces[id] || 0;
        tarjeta.querySelector('[data-aprendido]').checked = dominado;
    });
    progreso.textContent = `${estado.aprendidos.length} de ${tarjetas.length} atajos dominados`;
}
// ===== EVENTOS =====
botonesSistema.forEach(b => b.addEventListener('click', () => cambiarSistema(b.dataset.sistema)));
btnReiniciar.addEventListener('click', reiniciar);
// Casillas "Ya lo domino" de cada tarjeta
tarjetas.forEach(tarjeta => {
    tarjeta.querySelector('[data-aprendido]').addEventListener('change', evento => {
        alternarAprendido(tarjeta.dataset.id, evento.target.checked);
    });
});
// Detecta cuando el usuario presiona un atajo (Ctrl o ⌘ + letra)
document.addEventListener('keydown', evento => {
    if (evento.repeat) return;                          // ignora si la tecla se mantiene pulsada
    if (!evento.ctrlKey && !evento.metaKey) return;     // solo nos interesan los atajos
    const letra = evento.key.toLowerCase();
    const tarjeta = [...tarjetas].find(t => t.dataset.tecla === letra);  // busca la tarjeta
    if (tarjeta) registrarPractica(tarjeta);
});
// ===== INICIO: se ejecuta al cargar o refrescar la página =====
dibujarPantalla();