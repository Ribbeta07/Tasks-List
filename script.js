const indexedDB = window.indexedDB;
const taskInput = document.getElementById("taskInput");
const createBtn = document.getElementById("createBtn");
const deleteBtn = document.getElementById("deleteBtn");
const tareasSinHacer = document.getElementById("tareasSinHacer");
const tableContainer = document.getElementById("tableContainer")

let db;
const request = indexedDB.open('tasksList', 1);

request.onsuccess = () => {
    db = request.result
    console.log('OPEN', db)
    readData()
}

request.onupgradeneeded = (e) => {
    db = e.target.result
    console.log('Create', db)
    const objectStore = db.createObjectStore('tasks', {
        keyPath: "taskName",
    })
}

request.onerror = (error) => {
    console.log('Error', error)
}

const addData = (data) => {
    const transaction = db.transaction(['tasks'], 'readwrite')
    const objectStore = transaction.objectStore('tasks')
    const request = objectStore.add(data)
    readData()
}

const readData = () => {
    const transaction = db.transaction(['tasks'], 'readonly')
    const objectStore = transaction.objectStore('tasks')
    const request = objectStore.openCursor();

    const fragment = document.createDocumentFragment();

    request.onsuccess = () => {
        const cursor = request.result;

        if (cursor) {
            const el = document.createElement("H3");
            el.textContent = cursor.value.taskName;
            el.dataset.key = cursor.key
            el.setAttribute("draggable", true)
            fragment.appendChild(el)


            deleteBtn.addEventListener("click", (e) => {
                deleteBtnFunc(el)
            })

            cursor.continue();
        } else {
            tareasSinHacer.textContent = "";
            tareasSinHacer.appendChild(fragment)
        }
    }
}


const deleteData = (key) => {
    const transaction = db.transaction(['tasks'], 'readwrite')
    const objectStore = transaction.objectStore('tasks')
    const request = objectStore.delete(key);

    request.onsuccess = () => {
        readData()
    }
}

createBtn.addEventListener('click', () => {
    const data = {
        "taskName": taskInput.value,
    }
    if (taskInput.value != "") {
        taskInput.value = "";
        addData(data)
    }
})


const deleteBtnFunc = (el) => {
    deleteData(el.dataset.key)
}



document.addEventListener("keydown", (e) => {
    const data = {
        "taskName": taskInput.value,
    }
    if (taskInput.value != "" && e.key == "Enter") {
        addData(data)
        taskInput.value = "";
    }
})

const trashcan = document.getElementById("trashcan")

deleteBtn.addEventListener("click", () => {
    deleteBtn.classList.add("xd")
})

tableContainer.addEventListener("dragstart", (e) => {
    e.target.id = e.target.textContent;
    e.dataTransfer.setData("text/plain", e.target.id)
})

const checked = document.getElementById("checked")

trashcan.addEventListener("dragover", (e) => {
    trashcan.classList.add("trashcanActive")
    e.preventDefault()
})

trashcan.addEventListener("dragleave", (e) => {
    trashcan.classList.remove("trashcanActive")
    e.preventDefault()
})

trashcan.addEventListener("drop", (e) => {
    e.preventDefault()
    trashcan.classList.remove("trashcanActive")
    const el = document.getElementById(e.dataTransfer.getData("text"))

    deleteData(el.dataset.key)
})