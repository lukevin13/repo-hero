// Useful constants
const GIT_API = 'https://api.github.com/'
const REL_TO_BUTTON = {
    'rel="first"': '<<',
    'rel="prev"': '<',
    'rel="next"': '>',
    'rel="last"': '>>',
}

// Get elements from html
const userForm = document.getElementById('user-form');
const userInput = document.getElementById('user-input');
const resultsTable = document.getElementById('results-table');
const pagination = document.getElementById('pagination');

// Add submit event listener to form
userForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSubmit();
});

// Makes the git api request url and sends it
const handleSubmit = () => {
    const url = `${GIT_API}users/${userInput.value}/repos?page=1`;
    // console.log(url); // Used for logging requests
    sendApiRequest(url);
}

// Sends an async http GET request to the url
const sendApiRequest = (url) => {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = (e) => {
        if (xhttp.readyState === 4) {
            if (xhttp.status === 200) {
                handleApiResponse(xhttp);
            } else if (xhttp.status === 404) {
                alert('Username not found. Did you spell it correctly?  ')
            }
        }
    }
    xhttp.open('GET', url, true);
    xhttp.send();
}

// Callback function for handling the http response
const handleApiResponse = (xhttp) => {

    const linkHeader = xhttp.getResponseHeader('Link');
    if (linkHeader) {
        const linksMap = convertLinksHeaderToMap(linkHeader);
        displayPages(linksMap);
    }

    const repositories = JSON.parse(xhttp.responseText);
    displayRepositories(repositories);
}

// Parses the header value of 'Link' in the git response header and makes a map
// from page relationships to associated git api url
const convertLinksHeaderToMap = (linksHeader) => {
    const linksList = linksHeader.split(', ');
    let linksMap = new Map();
    for (let i = 0; i < linksList.length; i++) {
        const linkInfoSplit = linksList[i].split('; ');
        const linkHref = linkInfoSplit[0].slice(1, -1); // Remove '<', '>' from ends of string
        const linkRel = linkInfoSplit[1];
        linksMap.set(linkRel, linkHref);
    }
    return linksMap;
}

//----------- Functions for rendering results --------------
const displayRepositories = (repositories) => {
    resultsTable.innerHTML = ''; // Clear the results table of existing elements
    for (let i = 0; i < repositories.length; i++) {
        const repoTableRow = makeTableRowFromRepo(repositories[i]);
        resultsTable.appendChild(repoTableRow); // Populate the results table with the repository information
    }
}

const displayPages = (linksMap) => {
    pagination.innerHTML = '';

    const pageButtons = makePageButtonsFromLinksMap(linksMap);
    pagination.appendChild(pageButtons);
}

//------------ HTML DOM formatting functions -------------------
// Puts repository data into a row for the table
const makeTableRowFromRepo = (repoInfo) => {
    // Destructure properties from the repoInfo object
    const { name, html_url, owner } = repoInfo;
    const { login, avatar_url } = owner;

    // Make DOM Nodes
    const tr = document.createElement('tr');

    const p_name = document.createElement('p'); // Repo name
    p_name.appendChild(document.createTextNode(name));

    const a_html_url = document.createElement('a'); // Repo url
    a_html_url.href = html_url;
    a_html_url.appendChild(document.createTextNode(html_url));

    const p_login = document.createElement('p'); // Owner name
    p_login.appendChild(document.createTextNode(login));

    const img_avatar_url = document.createElement('img'); // Owner Avatar
    img_avatar_url.src = avatar_url;
    img_avatar_url.alt = `${login} avatar`;
    img_avatar_url.classList.add('img-fluid'); // Responsive image
    img_avatar_url.classList.add('img-64'); // width: 64px image

    // Wrap with 'td' tag
    const td_name = wrapWithTdNode(p_name);
    const td_html_url = wrapWithTdNode(a_html_url);
    const td_login = wrapWithTdNode(p_login);
    const td_avatar_url = wrapWithTdNode(img_avatar_url);

    // Add to 'tr' wrapper
    tr.appendChild(td_name);
    tr.appendChild(td_html_url);
    tr.appendChild(td_login);
    tr.appendChild(td_avatar_url);

    return tr;
}

// Wraps a child node in a td node
const wrapWithTdNode = (child) => {
    const td = document.createElement('td');
    td.appendChild(child);
    return td;
}

// Makes buttons for page navigation
const makePageButtonsFromLinksMap = (linksMap) => {

    const div_wrap = document.createElement('div');
    for (let rel of linksMap.keys()) {
        const button = document.createElement('button');
        button.appendChild(document.createTextNode(REL_TO_BUTTON[rel]));
        button.onclick = (e) => {
            e.preventDefault();
            sendApiRequest(linksMap.get(rel));
        }
        div_wrap.appendChild(button);
    }

    return div_wrap;
}
