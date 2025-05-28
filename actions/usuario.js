class Tareas {
    static estados = [];
    constructor() {
        this.tareas = [];
        this.estados = [
            { id: 1, nombre: 'Pendiente' },
            { id: 2, nombre: 'En Progreso' },
            { id: 3, nombre: 'Completada' }
        ];//Estos son los estados predefinidos correspondientes a las tareas
    }

    agregarTarea(tarea) {
        this.tareas.push(tarea);
    }

    listarTareas() {
        return this.tareas;
    }

    eliminarTarea(id) {
        this.tareas = this.tareas.filter(t => t.id !== id);
    }
}

function traerTareas() {
    console.log(Tareas.estados.nombre);
}

function eliminarTarea() {

}

function cambiarEstadoTarea() {

}