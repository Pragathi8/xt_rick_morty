const $ = require('jquery');
var characterContainer = $('.character-container')[0];

$(document).ready(() => {
    var url = 'https://rickandmortyapi.com/api/character/';
    fetch(url)
    .then(res =>res.json())
    .then(data => {
        saveDataInLocalDB(data);
        createCards(data.results, characterContainer);
    });
    accordion('.filter-item', '.filter-item-inner-heading', '.filter-attribute-list');
    document.getElementById("apply-filters").addEventListener('click',getFilteredCharacters);
    document.getElementsByClassName("sorting-values")[0].addEventListener('click', sortById);
});

function accordion(section, heading, list) {
	$(section).each(function() {
		var that = this,
				listHeight = $(this).find(list).height();

		$(this).find(heading).click(function() {
			$(this).toggleClass('plus minus');
			$(that).find(list).slideToggle(250);
		});
	});
};

function saveDataInLocalDB(data) {
    let url = "http://localhost:3000/data";
    let allCharacters = data.results.map(ch => ch.name);
    autocomplete(document.getElementById("myInput"), allCharacters);
    fetch(url,{
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(data.results)
    });
}

function createCards(data, target) {
    var html= "";
    data.forEach(element => {
        html += `
            <div class="col-lg-3 col-md-4 col-6">
                <div class="card">
                    <img class="card-img-top img-fluid" src="${element.image}" alt="Card image cap">
                    <div class="card-block">
                        <h4 class="card-title">${element.name}</h4>
                        <p class="card-text">
                            <small>Id: ${element.id}</small>
                            <small>Created: 2 Years ago..</small>
                        </p>
                        <table class="table table-dark">
                            <tbody>
                                <tr>
                                    <th>STATUS</td>
                                    <td>${element.status}</td>
                                </tr>
                                <tr>
                                    <th>SPECIES</td>
                                    <td>${element.species}</td>
                                </tr>
                                <tr>
                                    <th>GENDER</td>
                                    <td>${element.gender}</td>
                                </tr>
                                <tr>
                                    <th>ORIGIN</td>
                                    <td>${element.origin.name}</td>
                                </tr>
                                <tr>
                                    <th>LAST LOCATION</td>
                                    <td>${element.location.name}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `
    });
    target.innerHTML = html;
    html= '';
}

function autocomplete(inp, arr) {
    var currentFocus;
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        closeAllLists();
        if (!val) { return false;}
        currentFocus = -1;
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        this.parentNode.appendChild(a);
        for (i = 0; i < arr.length; i++) {
          if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
            b = document.createElement("DIV");
            b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            b.innerHTML += arr[i].substr(val.length);
            b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            b.addEventListener("click", function(e) {
                inp.value = this.getElementsByTagName("input")[0].value;
                closeAllLists();
            });
            a.appendChild(b);
          }
        }
        document.getElementById('myInputautocomplete-list').addEventListener("click", function (e) {
            e.preventDefault();
            let name = e.target.getElementsByTagName('input')[0].value;
            getDetailsByName(name);
            closeAllLists(e.target);
        });
    });
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
          currentFocus++;
          addActive(x);
        } else if (e.keyCode == 38) { 
          currentFocus--;
          addActive(x);
        } else if (e.keyCode == 13) {
          e.preventDefault();
          if (currentFocus > -1) {
            if (x) x[currentFocus].click();
          }
        }
    });
    function addActive(x) {
      if (!x) return false;
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (x.length - 1);
      x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }
    function closeAllLists(elmnt) {
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
          x[i].parentNode.removeChild(x[i]);
        }
      }
    }
}

function getDetailsByName(name) {
    let url = "http://localhost:3000/data";
    fetch(url)
    .then(res =>res.json())
    .then(data => {
        var card = data.find(obj => obj.name == name);
        createCards(Array.of(card), characterContainer);
        fetch(url,{
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify(card)
        });
    });
}

function getAllCheckedCheckboxes() {
    let checkboxes = document.getElementsByClassName('filter-attribute-checkbox');
    let checkboxesChecked = [];
    for (var i=0; i<checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            checkboxesChecked.push(checkboxes[i]);
        }
    }
    return checkboxesChecked.length > 0 ? checkboxesChecked : null;
}

function getFilteredCharacters() {
    let filterItems = getAllCheckedCheckboxes();
    let filterArray = [];
    let filteredData = [];
    filterItems.forEach(item => {
        let category = item.parentElement.parentElement.parentElement.parentElement.dataset.value;
        let categoryValue = item.nextElementSibling.innerText;
        filterArray.push({category: category, categoryValue: categoryValue});
    });
    let url = "http://localhost:3000/data";
    fetch(url)
    .then(res =>res.json())
    .then(data => {
        let finalList = [];
        var results = data;
        for(var arr in results) {
            for(var filter in filterArray) {
                if(results[arr].species === filterArray[filter].categoryValue || 
                    results[arr].gender === filterArray[filter].categoryValue ||
                    results[arr].origin.name === filterArray[filter].categoryValue
                    ) {
                    finalList.push(results[arr])
                }
            }
        }
        for(i=0; i < finalList.length; i++){
            if(filteredData.indexOf(finalList[i]) === -1) {
                filteredData.push(finalList[i]);
            }
        }
        createCards(filteredData, characterContainer);
        fetch(url,{
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify(filteredData)
        });
    });
}

function sortById(event) {
    let sortingOrder = event.target.dataset.value;
    let url = "http://localhost:3000/data";
    fetch(url)
    .then(res =>res.json())
    .then(response => {
        let data = response;
        if(sortingOrder === "ascending") {
            data.sort((a, b) => parseInt(a.id) - parseInt(b.id));
        } else if(sortingOrder === "descending") {
            data.sort((a, b) => parseInt(b.id) - parseInt(a.id));
        }
        createCards(data, characterContainer);
    })
}