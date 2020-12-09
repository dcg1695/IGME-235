// API URL
const POKE_URL = "https://pokeapi.co/api/v2/pokemon/";

// Making some Pokevariables
let searchButton;
let radioButtons;
let radioValue;

let specificDiv;
let rangeDiv;
let randomDiv;
let docsDiv;

let rangeResults;
let pokemonResults;

let defaultPokedexNum;

let pokedexNum;

let statusTxt;
let displayTerm = "";

let pokeLeftArrow;
let pokeRightArrow;
let rangeLeftArrow;
let rangeRightArrow;

let limit = 0;
let offset = 0;

const searches = {
    POKEMON: 'pokemon',
    RANGE: 'range',
    RANDOM: 'random'
};
const typeColors = {
    water: '#54AAFF',
    fire: '#FF9A63',
    grass: '#69D66D',
    normal: '#C6C6A7',
    rock: '#D1C17D',
    poison: '#DD4AFF',
    flying: '#C6B7F5',
    bug: '#A3CC58',
    electric: '#FAE078',
    ground: '#F5AE58',
    fairy: '#FFABED',
    psychic: '#FF6997',
    steel: '#D1D1E0',
    dark: '#4A4C57',
    ghost: '#5D3EB5',
    fighting: '#DB404C',
    ice: '#7BE3E3',
    dragon: '#584FFF'
};

let searchType = searches.POKEMON;

// When the window loads, set up the app
window.onload = setUp;

// Set up local storage and values for global variables
function setUp()
{
    document.querySelector("#specificSearch").onclick = specificSearchClicked;
    document.querySelector("#rangeSearch").onclick = rangeSearchClicked;
    document.querySelector("#randomSearch").onclick = randomSearchClicked;
    specificDiv = document.querySelector("#specificDiv");
    rangeDiv = document.querySelector("#rangeDiv");
    randomDiv = document.querySelector("#randomDiv");
    docsDiv = document.querySelector("#docsDiv");
    rangeDiv.hidden = true;
    randomDiv.hidden = true;
    docsDiv.hidden = true;

    radioButtons = document.querySelectorAll(".searchType");
    rangeResults = document.querySelector("#rangeResults");
    pokemonResults = document.querySelector("#pokemonResults");

    statusTxt = document.querySelector("#status");

    rangeResults.hidden = true;
    rangeResults.style.display = "none";
    pokemonResults.hidden = true;
    pokemonResults.style.display = "none";

    for (radio of radioButtons)
    {
        radio.onchange = radioChanged;
    }

    // Set up some navigation arrows
    pokeLeftArrow = document.querySelector("#pokeLeft");
    pokeRightArrow = document.querySelector("#pokeRight");
    pokeLeftArrow.onclick = prevPokemon;
    pokeRightArrow.onclick = nextPokemon;

    rangeLeftArrow = document.querySelector("#rangeLeft");
    rangeRightArrow = document.querySelector("#rangeRight");
    rangeLeftArrow.onclick = prevRange;
    rangeRightArrow.onclick = nextRange;

    // Set up local storage
    const specificTerm = document.querySelector("#specificTerm");
    const pokedexSearchTerm = document.querySelector("#rangeTerm");
    const prefix = "dcg1695-";
    const specificTermKey = prefix + "specificTerm";
    const pokedexSearchKey = prefix + "pokedexNum";
    const storedSpecificTerm = localStorage.getItem(specificTermKey);
    const storedPokedexSearch = localStorage.getItem(pokedexSearchKey);

    if (storedSpecificTerm) specificTerm.value = storedSpecificTerm;
    else specificTerm.value = "Pikachu";

    if (storedPokedexSearch)
    {
        pokedexSearchTerm.value = storedPokedexSearch;
        defaultPokedexNum = storedPokedexSearch;
    }
    else defaultPokedexNum = 25;

    specificTerm.onchange = e => {localStorage.setItem(specificTermKey, e.target.value);};
    pokedexSearchTerm.onchange = e => {localStorage.setItem(pokedexSearchKey, e.target.value);};
}

// Change the type of search when radio buttons are changed
function radioChanged(e)
{
    radioValue = e.target.value;

    if (radioValue == "pokemon")
    {
        specificDiv.hidden = false;
        rangeDiv.hidden = true;
        randomDiv.hidden = true;
        docsDiv.hidden = true;
        searchType = searches.POKEMON;
    }
    else if (radioValue == "range")
    {
        rangeDiv.hidden = false;
        specificDiv.hidden = true;
        randomDiv.hidden = true;
        docsDiv.hidden = true;
        searchType = searches.RANGE;
    }
    else if (radioValue == "random")
    {
        randomDiv.hidden = false;
        specificDiv.hidden = true;
        rangeDiv.hidden = true;
        docsDiv.hidden = true;
        searchType = searches.RANDOM;
    }
    else
    {
        docsDiv.hidden = false;
        specificDiv.hidden = true;
        rangeDiv.hidden = true;
        randomDiv.hidden = true;
    }
}

// Conduct a random search when the random button is clicked
function randomSearchClicked()
{
    searchType = searches.RANDOM;

    let url = POKE_URL;
    document.querySelector("#rangeTerm").value = defaultPokedexNum;
    
    // Gets a random pokemon number (1-893 aka Bulbasaur to Zarude)
    let term = Math.floor(Math.random() * 893) + 1 + "";
    displayTerm = term;

    // Remove trailing or leading spaces
    displayTerm = displayTerm.trim();

    // If there's no term to search for, then exit the function
    if (displayTerm.length < 1) return;

    // Make sure the term is lowercase to append it at the end of the URL
    url += displayTerm.toLowerCase();

    // Update the UI
    statusTxt.style.color = "#eee";
    statusTxt.innerHTML = `<b>Searching...</b><img alt="Loading..." src="images/pika.gif" id="loadGif">`;

    // Show URL in the console
    //console.log(url);

    // Request Data
    getData(url);
}

// Conduct a search of a certain range when the range option button is pressed
function rangeSearchClicked()
{
    searchType = searches.RANGE;
    let url = POKE_URL;
    let term = "";

    // Set the search paramaters
    offset = (document.querySelector("#rangeTerm").value - 1);
    limit = document.querySelector("#limit").value;
    term += "?offset=" + offset;
    term += "&limit=" + limit;
    displayTerm = term;

    // Remove trailing or leading spaces
    displayTerm = displayTerm.trim();

    // If there's no term to search for, then exit the function
    if (displayTerm.length < 1) return;

    // Make sure the term is lowercase to append it at the end of the URL
    url += displayTerm.toLowerCase();

    // Update the UI
    statusTxt.style.color = "#eee";
    statusTxt.innerHTML = `<b>Searching...</b><img alt="Loading..." src="images/pika.gif" id="loadGif">`;

    // Show URL in the console
    //console.log(url);

    // Request Data
    getData(url);
}

// Conduct a normal Pokémon search when specific button is pressed
function specificSearchClicked()
{
    searchType = searches.POKEMON;
    let url = POKE_URL;

    document.querySelector("#rangeTerm").value = defaultPokedexNum;

    let term = document.querySelector("#specificTerm").value;
    displayTerm = term;

    // Remove trailing or leading spaces
    displayTerm = displayTerm.trim();

    // If there's no term to search for, then exit the function
    if (displayTerm.length < 1) return;

    // Make sure the term is lowercase to append it at the end of the URL
    url += displayTerm.toLowerCase();

    // Update the UI
    statusTxt.style.color = "#eee";
    statusTxt.innerHTML = `<b>Searching...</b><img alt="Loading..." src="images/pika.gif" id="loadGif">`;

    // Show URL in the console
    //console.log(url);

    // Request Data
    getData(url);
}

// Get the data from the passed-in URL
function getData(url)
{
    rangeResults.hidden = true;
    rangeResults.style.display = "none";
    pokemonResults.hidden = true;
    pokemonResults.style.display="none";

    // 1 - Create a new XHR Object
    let xhr = new XMLHttpRequest();

    // 2 - Set the onload handler
    xhr.onload = dataLoaded;

    // 3 - Set the onerror handler
    xhr.onerror = dataError;

    // 4 - Open connection and send the request
    try
    {
        xhr.open("GET", url);
    }
    catch(err)
    {
        return;
    }
    xhr.send();
}

// AFTER ADDING BASE CSS FOR WEB APP,
// ADD COLOR STYLING CODE FOR STAT LABELS & TYPES &
// ADD ABILITY DESCRIPTIONS
function dataLoaded(e)
{
    let xhr = e.target;

    // Make sure the search is valid. If not, update the status text
    // Search is valid if the search matches what's in the API database
    if (e.target.status == 404 || isNaN(document.querySelector("#rangeTerm").value) || document.querySelector("#rangeTerm").value == "" ||
    parseInt(document.querySelector("#rangeTerm").value) < 1 || parseInt(document.querySelector("#rangeTerm").value) + parseInt(limit) > 893 + 1)
    {
        statusTxt.style.color = "#d11d38";
        statusTxt.innerHTML = "<b>Invalid Search! Please try again.</b>";
        return;
    }

    // Turn the text into a parsable JavaScript object
    let pkmn = JSON.parse(xhr.responseText);

    // Random chance for web app to grab a shiny Pokemon (actual shiny odds)
    // Hide shiny star before checking shininess
    let shiny = Boolean((Math.floor(Math.random() * 4096) + 1) <= 2);
    document.querySelector("#shinyImg").hidden = true;

    statusTxt.style.color = "#24ad54";
    statusTxt.innerHTML = "Searching Complete!";

    // This is a range search; hide everything not important to this
    // Show the range search div
    if (searchType == searches.RANGE)
    {
        rangeResults.hidden = false;
        rangeResults.style.display = "block";
        pokemonResults.hidden = true;
        pokemonResults.style.display = "none";
        let results = pkmn.results;
        let rangeResultsList = document.querySelector("#rangeResultsList");
        rangeResultsList.style.columnCount = 3;

        // Clear the lists
        let lastResultNode = rangeResultsList.lastElementChild;
        while (lastResultNode)
        {
            rangeResultsList.removeChild(lastResultNode);
            lastResultNode = rangeResultsList.lastElementChild;
        }

        // Populate the lists with search results
        for (let i = 0; i < results.length; i++)
        {
            let newLi = document.createElement("li");
            newLi.setAttribute('data-url', results[i].url);
            newLi.innerHTML = formatName(results[i].name);
            newLi.onclick = linkClicked;
            rangeResultsList.appendChild(newLi);
        }

        // This is either a specific search or a random search.
        // In either case, display the single pokemon div and hide range search results
    }
    else
    {
        rangeResults.hidden = true;
        pokemonResults.hidden = false;
        pokemonResults.style.display = "none";
        pokemonResults.style.display = "grid";

        // Get the data and stores it in variables
        let spriteURL = pkmn.sprites.front_default;
        if (shiny) spriteURL = pkmn.sprites.front_shiny; // If the random number was at most 2 (shiny odds = 2/4096), show shiny form
        let abilities = pkmn.abilities; //console.log(abilities);
        let height = pkmn.height;
        let weight = pkmn.weight;
        pokedexNum = pkmn.id;
        let name = pkmn.name;
        let moves = pkmn.moves; //console.log(moves);
        let types = pkmn.types; //console.log(types);
        let stats = pkmn.stats; //console.log(stats);

        // Clear the abilities list
        let abilitiesList = document.querySelector("#pokeAbilities");
        let lastAbilityNode = abilitiesList.lastElementChild;
        while (lastAbilityNode)
        {
            abilitiesList.removeChild(lastAbilityNode);
            lastAbilityNode = abilitiesList.lastElementChild;
        }
        
        // Clear the moves list
        let movesList = document.querySelector("#movesList");
        let lastMoveNode = movesList.lastElementChild;
        while (lastMoveNode)
        {
            movesList.removeChild(lastMoveNode);
            lastMoveNode = movesList.lastElementChild;
        }

        // Add Pokémon's basic information
        document.querySelector("#pokemonTitle").innerHTML = formatName(name);
        document.querySelector("#pokeImg").src = spriteURL;
        if (shiny) document.querySelector("#shinyImg").hidden = false; // If the Pokemon is shiny, reveal its shiny star
        document.querySelector("#pokeNum").innerHTML = "<strong>Pokedex #:</strong> " + pokedexNum;
        document.querySelector("#pokeType").innerHTML = `<strong>Type:</strong> <b id="type1">${formatString(types[0].type.name)}</b>`;
        document.querySelector("#type1").style.color = typeColors[types[0].type.name]; // Give the Pokemon's first type its matching color
        if (types.length > 1)
        {
            document.querySelector("#pokeType").innerHTML += ` and <b id="type2">${formatString(types[1].type.name)}</b>`;
            document.querySelector("#type2").style.color = typeColors[types[1].type.name]; // Give the Pokemon's first type its matching color
        }
        document.querySelector("#pokeHeight").innerHTML = "<strong>Height</strong>: " + height/10 + " m";
        document.querySelector("#pokeWeight").innerHTML = "<strong>Weight</strong>: " + weight/10 + " kg";

        // Populate the abilities list, if any abilities exist
        abilitiesList.innerHTML = "";
        if (abilities.length < 1) abilitiesList.innerHTML = "No abilities currently available for this Pokémon.";
        else
        {
            for (let a = 0; a < abilities.length; a++)
            {
                let newLi = document.createElement("li");
                newLi.innerHTML = formatString(abilities[a].ability.name);
                if (abilities[a].is_hidden) newLi.innerHTML = formatString(abilities[a].ability.name + " (hidden)");
                abilitiesList.appendChild(newLi);
            }
        }

        // Add Pokémon's stats
        document.querySelector("#hp").innerHTML = "<strong>HP:</strong> " + stats[0].base_stat;
        document.querySelector("#attack").innerHTML = "<strong>Attack:</strong> " + stats[1].base_stat;
        document.querySelector("#defense").innerHTML = "<strong>Defense:</strong> " + stats[2].base_stat;
        document.querySelector("#spAtk").innerHTML = "<strong>Special Attack:</strong> " + stats[3].base_stat;
        document.querySelector("#spDef").innerHTML = "<strong>Special Defense:</strong> " + stats[4].base_stat;
        document.querySelector("#speed").innerHTML = "<strong>Speed:</strong> " + stats[5].base_stat;


        // Add Pokémon's moves in a list, if they exist
        movesList.innerHTML = "";
        if (moves.length < 1)
        {
            let emptyLi = document.createElement("li");
            emptyLi.innerHTML = "No moves available for this Pokémon now.";
            movesList.appendChild(emptyLi);
        }
        else
        {
            for (let i = 0; i < moves.length; i++)
            {
                let newLi = document.createElement("li");
                newLi.innerHTML = formatString(moves[i].move.name);
                movesList.appendChild(newLi);
            }
        }
    }
}

// Format the string so that the hyphens retrieved from the database are removed and the first letter of every word is capitalilzed
// For anything other than names
function formatString(str)
{
    let index = str.indexOf('-');
    if (index != -1)
    {
        // If there is a hyphen in the name, make the first letter uppercase, replace the hyphen with a space, 
        // and finally make the first letter of the second word uppercase
        return str.charAt(0).toUpperCase() + str.slice(1, index) + " " + str.charAt(index + 1).toUpperCase() + str.slice(index + 2);
    }
    // Make the first letter uppercase
    return str.charAt(0).toUpperCase() + str.slice(1);
}
// Format the string so that the words are capitalized but necessary hyphens in the name are maintained
// For only names
function formatName(name)
{
    let index = name.indexOf('-');
    if (index != -1)
    {
        // If there is a hyphen in the name, make the first letter uppercase, place the hyphen back in the name, 
        // and finally make the first letter of the second half uppercase
        return name.charAt(0).toUpperCase() + name.slice(1, index) + "-" + name.charAt(index + 1).toUpperCase() + name.slice(index + 2);
    }
    // Make the first letter uppercase
    return name.charAt(0).toUpperCase() + name.slice(1);
}

// For when the user clicks on a range search result
// Load the individual Pokémon data
function linkClicked(e)
{
    searchType = searches.POKEMON;
    rangeResults.hidden = true;
    rangeResults.style.display = "none";
    getData(e.target.dataset.url);
}

function dataError(e)
{
    console.log("Error! An oopsie was made.");
}

// When the user presses the next arrow key on the specific pokemon search,
// bring up info on the next Pokémon
function nextPokemon()
{
    let nextNum = ++pokedexNum;
    searchType = searches.POKEMON

    // Make sure the user doesn't go out of bounds
    if (nextNum > 893) nextNum = 1;
    getData(POKE_URL + nextNum);
}

// When the user presses the back arrow key on the specific pokemon search,
// bring up info on the previous Pokémon
function prevPokemon()
{
    let nextNum = --pokedexNum;
    searchType = searches.POKEMON;

    // Make sure the user doesn't go out of bounds
    if (nextNum <= 0) nextNum = 893;
    getData(POKE_URL + nextNum);
}

// When the user presses the next arrow key on the range search,
// bring up info on the next range of Pokémon
function nextRange()
{
    searchType = searches.RANGE;
    offset = parseInt(offset) + parseInt(limit);

    // Make sure the user doesn't go out of bounds
    if (parseInt(offset) + parseInt(limit) > 893) offset = 0;

    getData(POKE_URL + "?offset=" + offset + "&limit=" + limit);
}

// When the user presses the back arrow key on the range search,
// bring up info on the previous range of Pokémon
function prevRange()
{
    searchType = searches.RANGE;
    offset = parseInt(offset) - parseInt(limit);
    
    // Make sure the user doesn't go out of bounds
    if (offset <= 0) offset = 0;
    if (parseInt(offset) + parseInt(limit) > 893) offset = 0;

    getData(POKE_URL + "?offset=" + offset + "&limit=" + limit);
}