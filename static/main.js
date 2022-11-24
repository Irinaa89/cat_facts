function createPageBtn(page, classes = []) {
  let btn = document.createElement("button");
  classes.push("btn");
  for (cls of classes) {
    btn.classList.add(cls);
  }
  btn.dataset.page = page;
  btn.innerHTML = page;
  return btn;
}

function renderPaginationElement(info) {
  let btn;
  let paginationContainer = document.querySelector(".pagination");
  paginationContainer.innerHTML = "";

  btn = createPageBtn(1, ["first-page-btn"]);
  btn.innerHTML = "Первая страница";
  if (info.current_page == 1) {
    btn.style.visibility = "hidden";
  }
  paginationContainer.append(btn);

  let buttonsContainer = document.createElement("div");
  buttonsContainer.classList.add("pages-btns");
  paginationContainer.append(buttonsContainer);

  let start = Math.max(info.current_page - 2, 1);
  let end = Math.min(info.current_page + 2, info.total_pages);
  for (let i = start; i <= end; i++) {
    buttonsContainer.append(
      createPageBtn(i, i == info.current_page ? ["active"] : [])
    );
  }

  btn = createPageBtn(info.total_pages, ["last-page-btn"]);
  btn.innerHTML = "Последняя страница";
  if (info.current_page == info.total_pages) {
    btn.style.visibility = "hidden";
  }
  paginationContainer.append(btn);
}

function perPageBtnHandler(event) {
  downloadData(1);
}

function setPaginationInfo(info) {
  document.querySelector(".total-count").innerHTML = info.total_count;
  let start =
    info.total_count > 0 ? (info.current_page - 1) * info.per_page + 1 : 0;
  document.querySelector(".current-interval-start").innerHTML = start;
  let end = Math.min(info.total_count, start + info.per_page - 1);
  document.querySelector(".current-interval-end").innerHTML = end;
}

function pageBtnHandler(event) {
  if (event.target.dataset.page) {
    downloadData(event.target.dataset.page);
    window.scrollTo(0, 0);
  }
}

function createAuthorElement(record) {
  let user = record.user || { name: { first: "", last: "" } };
  let authorElement = document.createElement("div");
  authorElement.classList.add("author-name");
  authorElement.innerHTML = user.name.first + " " + user.name.last;
  return authorElement;
}

function createUpvotesElement(record) {
  let upvotesElement = document.createElement("div");
  upvotesElement.classList.add("upvotes");
  upvotesElement.innerHTML = record.upvotes;
  return upvotesElement;
}

function createFooterElement(record) {
  let footerElement = document.createElement("div");
  footerElement.classList.add("item-footer");
  footerElement.append(createAuthorElement(record));
  footerElement.append(createUpvotesElement(record));
  return footerElement;
}

function createContentElement(record) {
  let contentElement = document.createElement("div");
  contentElement.classList.add("item-content");
  contentElement.innerHTML = record.text;
  return contentElement;
}

function createListItemElement(record) {
  let itemElement = document.createElement("div");
  itemElement.classList.add("facts-list-item");
  itemElement.append(createContentElement(record));
  itemElement.append(createFooterElement(record));
  return itemElement;
}

function renderRecords(records) {
  let factsList = document.querySelector(".facts-list");
  factsList.innerHTML = "";
  for (let i = 0; i < records.length; i++) {
    factsList.append(createListItemElement(records[i]));
  }
}

// ==================================

let intersectionsList = document.querySelector(".intersections"); // -- Нашли ul список с элементами совпадения

// -- Функция для нахождения совпадений в строке (2 часть задания)
function searchIntersections() {
  let searchField = document.querySelector(".search-field"); // -- Нашли поле с текстом
  let value = searchField.value; // -- Берем значение из поля

  // -- Если строка поиска пустая, то убираем класс "скрыть"
  if (value == "") {
    intersectionsList.classList.remove("hidden");
  }

  // -- Создаем ссылку на 2 часть задания
  let url = new URL(
    "http://cat-facts-api.std-900.ist.mospolytech.ru/autocomplete"
  );
  url.searchParams.append("q", value); // -- Заполняем параметр q нашим актуальным значением из поисковой строки

  let xhr = new XMLHttpRequest(); // -- Создаем объект класса XMLHttpRequest, метод GET, тип данных json
  xhr.open("GET", url);
  xhr.responseType = "json";

  xhr.onload = function () {
    const data = this.response; // -- Помещаем в переменную результаты совпадений
    intersectionsList.innerHTML = ""; // -- Удаляем все из списка

    // -- С помощью цикла берем значения из массива и выгружаем их в тег li
    for (let i = 0; i < data.length; i++) {
      if (value != "") {
        let itemElement = document.createElement("li"); // -- Создаем тег li
        itemElement.classList.add("intersections__item"); // -- Даем тегу класс intersections__item
        itemElement.innerHTML = data[i]; // -- Кладем в этот тег текст из текущего значения в массиве
        intersectionsList.append(itemElement); // -- Кладем в ul наш готовый li
      }
    }

    // -- Реализация клика по элементу
    let searchItems = document.querySelectorAll(".intersections__item"); // -- Нашли все элементы
    // -- Циклом проходимся по каждому элементу и вешаем на каждого событие по клику
    searchItems.forEach((item) => {
      item.addEventListener("click", (event) => {
        let textContent = event.target.textContent; // -- Забираем в переменную текст из элемента
        downloadData(1, textContent); // -- Вызываем функцию для поиска постов по кликнутому слову
        searchField.value = textContent; // -- Подставляем в поисковую строку слово, по которому кликнули
        intersectionsList.classList.add("hidden"); // -- Скрываем список
      });
    });
  };

  xhr.send();
}

function downloadData(page = 1, autocompleteValue) {
  let factsList = document.querySelector(".facts-list"); // -- Нашли тег div для записей
  let searchField = document.querySelector(".search-field"); // -- Нашли поле с текстом (1 часть задания)
  let value = searchField.value.trim(); // -- Взяли значение из поля и удалили все лишние пробелы (1 часть задания)
  let url = new URL(factsList.dataset.url); // -- Помещаем сюда ссылку для автозаполенения
  let perPage = document.querySelector(".per-page-btn").value; // -- Значение страниц

  if (autocompleteValue == "") {
    intersectionsList.classList.remove("hidden");
  }

  url.searchParams.append("page", page);
  url.searchParams.append("per-page", perPage);
  url.searchParams.append("q", autocompleteValue ? autocompleteValue : value); // -- Добавили в запрос ключ 'q' и туда передали значение из поля поисковика (1 часть задания)

  let xhr = new XMLHttpRequest();
  xhr.open("GET", url);
  xhr.responseType = "json";
  xhr.onload = function () {
    renderRecords(this.response.records); // -- Функция для вывода записей
    setPaginationInfo(this.response["_pagination"]); // -- Установка значения страниц
    renderPaginationElement(this.response["_pagination"]); // -- Установка значения страниц
    searchIntersections(this.response.records); // -- Вызываем функцию поиска
  };
  xhr.send();

  intersectionsList.classList.add("hidden"); // -- Добавить класс "скрыть" чтобы скрыть список
}

window.onload = function () {
  downloadData();
  document.querySelector(".pagination").onclick = pageBtnHandler;
  document.querySelector(".per-page-btn").onchange = perPageBtnHandler;
  document.querySelector(".search-btn").onclick = downloadData; // -- Добавили обработку по кнопке "Найти" (1 часть задания)
};
