// 1
window.onload = (e) => { document.querySelector("#search").onclick = searchButtonClicked };
	
// 2
let displayTerm = "";

// 3
function searchButtonClicked()
{
    console.log("searchButtonClicked() called");
    
    // 1
    const GIPHY_URL = "https://api.giphy.com/v1/gifs/search?";

    // 2
    // Public API key from here: https://developers.giphy.com/docs/
    // If this no longer works, get your own. IT'S FREE
    let GIPHY_KEY = "dc6zaTOxFJmzC";

    // 3 - Build up our URL string
    let url = GIPHY_URL;
    url += "api_key=" + GIPHY_KEY;

    // 4 - Parse the user-entered item we wish to search
    let term = document.querySelector("#searchterm").value;
    displayTerm = term;

    // 5 - Get rid of any trailing or leading whitespace.
    displayTerm = displayTerm.trim();

    // 6 - Encode spaces and special characters
    displayTerm = encodeURIComponent(displayTerm);

    // 7 - If there's no term to search for, then bail out of the function.
    if (displayTerm.length < 1) return;

    // 8 - Append the search term to the URL - the parameter name is 'q'.
    url += "&q=" + displayTerm;

    // 9 - Grab the user-chosen search 'limit' from the <select> and append it to the URL
    let limit = document.querySelector("#limit").value;
    url += "&limit=" + limit;

    // 10 - Update the UI
    document.querySelector("#status").innerHTML = "<b>Searching for '" + displayTerm + "'</b>" + `<img alt="Loading..." src="images/spinner.gif">`;

    // 11 - See what the URL looks like.
    console.log(url);


    //SNJFVi6gSVwoDZBSHiLHuz8TaNK794bx (personal API key, if needed)


    // 12 - Request data.
    getdata(url);
}

// 4
function getdata(url)
{
    // 1 - Create a new XHR object
    let xhr = new XMLHttpRequest();

    // 2 - Set the onload handler
    xhr.onload = dataLoaded;

    // 3 - Set the onerror handler
    xhr.onerror = dataError;

    // 4 - Open connection and send the request
    xhr.open("GET", url);
    xhr.send();
}

function dataLoaded(e)
{
    // 5 - event.target is the xhr object
    let xhr = e.target;

    // 6 - xhr.responseText is the JSON file we just downloaded
    console.log(xhr.responseText);

    // 7 - turn the text into a parsable Javascript object
    let obj = JSON.parse(xhr.responseText);

    // 8 - if there are no results, print a message and return
    if (!obj.data || obj.data.length == 0)
    {
        document.querySelector("#status").innerHTML = "<b>No results found for '" + displayTerm + "'</b>";
        return; // Bail out!
    }

    // 9 - start building an HTML string we will display to the user
    let results = obj.data;
    console.log("results.length = " + results.length);
    let bigString = "";

    // 10 - loop through the array of results
    for (let i = 0; i < results.length; i++)
    {
        let result = results[i];

        // 11 - get the URL to the gif
        let smallURL = result.images.fixed_width_downsampled.url;
        if (!smallURL) smallURL = "../images/no-image-found.png";

        // 12 - get the URL to the GIPHY page
        let url = result.url;

        // 13 - build a <div> to hold each result
        let rating = (result.rating ? result.rating : "N/A").toUpperCase();

        // 14 - build a <div> to hold each result
        // ES6 String Templating
        let line = `<div class='result'><img src='${smallURL}' title='${result.id}'>`;
        line += `<span><a target='_blank' href='${url}'>View of Giphy</a><p>Rating: ${rating}</p></span></div>`;

        // 14.5 - another way of doing the same thing above (Replaces this:)
        // let line = "<div class='result'>";
        // line += "<img src='";
        // line += smallURL;
        // line += "' title= '";
        // line += result.id;
        // line += "' />";
        // line += "<span><a target='_blank' href='" + url + "'>View on GIPHY</a>";
        // line += <p>Rating: ${rating}</p></span>;
        // line += "</div>";

        // 15 - add the <div> to 'bigString' and loop
        bigString += line;
    }

    // 16 - all done building the HTML - show it to the user!
    document.querySelector("#content").innerHTML = bigString;

    // 17 - update the status
    document.querySelector("#status").innerHTML = "<b>Success!</b><i>&nbsp;Here are " + results.length + " results for <q>" + displayTerm + "</q>.</i>";
}

function dataError(e)
{
    console.log("An error occurred.");
}