function initAutoComplete() {

    let countriesData = [];
    const countriesListEl = document.getElementById('countries');
    const countryListDropdown = document.getElementById('country-list-dd');
    const inputEl = document.getElementById('tag-input');  
    const selectedCountryCodes = [];
    let selectCountryData = [];
    let dropdownVisible = false;
    let timer;

    fetchData();
    attachListeners();

    function fetchData() {
        let data = localStorage.getItem('countryData');
        if (data) {
            data = JSON.parse(data);
            initRender(data);        
        } else {
            fetch('https://restcountries.eu/rest/v2/all')
            .then(response => response.json())
            .then(json => {
                localStorage.setItem('countryData', JSON.stringify(countriesData));
                initRender(json);
            });
        }
    }

    function initRender(data) {
        inputEl.setAttribute('contenteditable', true);
        countriesData = data;   
        appendCountryListDD(countriesData); 
    }

    function showCountriesData(data) {
        countriesListEl.innerHTML = JSON.stringify(data);
    }

    function appendCountryListDD(data) {
        countryListDropdown.innerHTML = '';
        data.forEach(country => {
            const countryEl = document.createElement('LI');
            countryEl.setAttribute('id', country.alpha3Code);
            countryEl.classList.add('country');
            countryEl.innerHTML = `${country.name}: ${country.alpha3Code}`;
            countryListDropdown.append(countryEl);
        });
        inputEl.innerHTML = '';
    }

    function showCountryDropdown() {
        countryListDropdown.classList.add('show');
        dropdownVisible = true;
    }

    function hideCountryDropdown(ev) {
        countryListDropdown.classList.remove('show');
        dropdownVisible = false;
    }

    function selectCountry(ev) {
        const countryCode = ev.target.id;
        selectedCountryCodes.push(countryCode);
        selectCountryData.push(countriesData.find(country => {
            return country.alpha3Code === countryCode;
        }));
        const textNode = Array.from(inputEl.childNodes).find(node => {
            return node.nodeType === Node.TEXT_NODE;
        });
        if (textNode) {
            inputEl.removeChild(inputEl.lastChild);
        }
        hideCountryDropdown();
        showCountryFromDropdown(countryCode, false);
        appendTagToInput(countryCode);
        showCountriesData(selectCountryData);
    }

    function appendTagToInput(countryCode) {
        const tag = document.createElement('SPAN');
        tag.setAttribute('id', countryCode);
        tag.setAttribute('contenteditable', false);
        tag.classList.add('tag');
        const cross = document.createElement('SPAN');
        cross.classList.add('remove');
        cross.addEventListener('click', removeTag);
        cross.innerHTML = 'x';
        tag.append(countryCode);
        tag.append(cross);
        inputEl.appendChild(tag);
    }

    function removeTag(ev) {
        const tag = ev.target.closest('.tag');
        const countryCode = tag.id;
        removeCountryData(countryCode);
        tag.remove();
    }

    function removeCountryData(countryCode) {
        showCountryFromDropdown(countryCode, true);
        selectCountryData = selectCountryData.filter(country => {
            return country.alpha3Code !== countryCode;
        });
        showCountriesData(selectCountryData);
    }

    function showCountryFromDropdown(countryCode, show) {
        const countryElFromDropdown = Array.from(countryListDropdown.querySelectorAll('.country')).find(countryEl => {
            return countryEl.id === countryCode
        });
        if (countryElFromDropdown) {
            if(show) {
                countryElFromDropdown.classList.remove('hide');
            } else {
                countryElFromDropdown.classList.add('hide');
            }
        }
    }

    function handleKeyUp() {
        clearTimeout(timer);
        timer = setTimeout(() => {
            filterDropdown();
        }, 300);
    }

    function handleKeyDown(ev) {
        if (ev.keyCode === 8) {
            const textNode = Array.from(inputEl.childNodes).find(node => {
                return node.nodeType === Node.TEXT_NODE;
            });
            if (!textNode) {
                const countryCode = ev.target && ev.target.lastElementChild && ev.target.lastElementChild.id;
                removeCountryData(countryCode);
            }
        } else if (!dropdownVisible) {
            showCountryDropdown();
        }
    }

    function filterDropdown() {
        const textNode = Array.from(inputEl.childNodes).find(node => {
            return node.nodeType === Node.TEXT_NODE;
        });
        const val = textNode && textNode.wholeText && textNode.wholeText.trim();
        Array.from(countryListDropdown.querySelectorAll('.country')).forEach(countryEl => {
            if (countryEl.innerHTML.toLowerCase().includes(val) && !selectedCountryCodes.includes(countryEl.id)) {
                countryEl.classList.remove('hide');
            } else {
                countryEl.classList.add('hide');
            }
        });   
    }

    function attachListeners() {
        inputEl.addEventListener('keydown', handleKeyDown);
        inputEl.addEventListener('keyup', handleKeyUp);
        countryListDropdown.addEventListener('click', selectCountry);    
    }
}