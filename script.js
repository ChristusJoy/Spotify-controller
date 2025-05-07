var redirect_uri = "https://spotify-controller-three.vercel.app"; //Change to your redirect URI
var client_id = ""; 
var client_secret = "";


var access_token = "";
var refresh_token = null;

var nextSongName = null;
var nextAlbumImage = null;
var nextArtistName = null;
var playbackState = null;

//Endpoint URLs

const AUTHORIZE = "https://accounts.spotify.com/authorize"
const TOKEN = "https://accounts.spotify.com/api/token";
const PLAYER = "https://api.spotify.com/v1/me/player";
function onPageLoad(){
    client_id = localStorage.getItem("client_id");
    client_secret = localStorage.getItem("client_secret");
    if ( window.location.search.length > 0 ){
        let code = getCode();
        fetchAccessToken( code );
        window.history.pushState("", "", redirect_uri); 
    }
    else{
        access_token = localStorage.getItem("access_token");
        if ( access_token == null ){
            console.log("No access token found. Requesting authorization..."); 
            document.getElementById("getTokenSection").style.display = 'block'; 
        }
        else {
            setInterval(currentlyPlaying, 2000);
            document.getElementById("deviceSection").style.display = 'block'; 
        }
    }
}

function requestAuth(){
    const scope = "user-read-currently-playing user-modify-playback-state user-read-playback-state";
    client_id = document.getElementById("clientId").value;
    client_secret = document.getElementById("clientSecret").value;
    localStorage.setItem("client_id", client_id);
    localStorage.setItem("client_secret", client_secret);

    const params = new URLSearchParams({
        client_id: client_id,
        response_type: "code",
        redirect_uri: encodeURI(redirect_uri),
        show_dialog: "true",
        scope: scope,
    });
    const url = `${AUTHORIZE}?${params.toString()}`;

    // Redirect the user to the authorization page
    window.location.href = url;
}

function getCode(){
    let code = null;
    const queryString = window.location.search;
    if ( queryString.length > 0 ){
        const urlParams = new URLSearchParams(queryString);
        code = urlParams.get('code')
    }
    return code;
}

function fetchAccessToken( code ){
    let body = "grant_type=authorization_code";
    body += "&code=" + code; 
    body += "&redirect_uri=" + encodeURI(redirect_uri);
    body += "&client_id=" + client_id;
    body += "&client_secret=" + client_secret;
    callAuthorizationApi(body);
}

function callAuthorizationApi(body){
    let xhr = new XMLHttpRequest();
    xhr.open("POST", TOKEN, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Authorization', 'Basic ' + btoa(client_id + ":" + client_secret));
    xhr.send(body);
    xhr.onload = handleAuthorizationResponse;
}

function handleAuthorizationResponse(){
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        console.log(data);
        if ( data.access_token != undefined ){
            access_token = data.access_token;
            localStorage.setItem("access_token", access_token);
            console.log("Access token: " + access_token);
        }
        if ( data.refresh_token  != undefined ){
            refresh_token = data.refresh_token;
            localStorage.setItem("refresh_token", refresh_token);
            console.log("Refresh token: " + refresh_token);
        }
        onPageLoad();
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function refreshAccessToken(){
    refresh_token = localStorage.getItem("refresh_token");
    let body = "grant_type=refresh_token";
    body += "&refresh_token=" + refresh_token;
    body += "&client_id=" + client_id;
    body += "&client_secret=" + client_secret;
    callAuthorizationApi(body);
}

//Media controls and Playback

function callApi(method, url, body, callback){
    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
    xhr.send(body);
    xhr.onload = callback;
}
function currentlyPlaying(){
    console.log("Currently playing");
    callApi( "GET", PLAYER + "?market=US", null, handleCurrentlyPlayingResponse );
}

function handleCurrentlyPlayingResponse(){
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        albumImage = data.item.album.images[0].url;
        songName = data.item.name;
        artistName = data.item.artists[0].name;
        playbackState = data.is_playing;
        document.getElementById("albumImage").src = albumImage;
        document.getElementById("songName").textContent = songName;
        document.getElementById("artistName").textContent = artistName;
        getQueue();

    }
    else if ( this.status == 204 ){
        console.log("No track is currently playing.");
    }
    else if ( this.status == 401 ){
        console.log("Token expired. Refreshing...");
        refreshAccessToken()
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function playPause(){
    if ( playbackState == true ){
        callApi( "PUT", PLAYER+'/pause', null, handleApiResponse );
        playbackState = false;
    }
    else {
        callApi("PUT", PLAYER + '/play', null, handleApiResponse);
        playbackState = true;
    }
}
function next(){
    callApi( "POST", PLAYER+'/next', null, handleNextResponse );
}

function previous(){
    callApi( "POST", PLAYER+'/previous', null, handleApiResponse );
}

function handleApiResponse(){
    if ( this.status == 200){
        console.log(this.responseText);
        setTimeout(currentlyPlaying, 2000);
    }
    else if ( this.status == 204 ){
        setTimeout(currentlyPlaying, 2000);
    }
    else if ( this.status == 401 ){
        refreshAccessToken()
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }    
}

//Optional preloading next song to improve playback

function getQueue(){
    callApi( "GET", PLAYER + "/queue", null, handleQueueResponse );
}

function handleQueueResponse(){
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        nextSongName = data.queue[0].name;
        nextAlbumImage = data.queue[0].album.images[0].url;
        nextArtistName = data.queue[0].artists[0].name;
        console.log("Next song loaded");
    }
    else if ( this.status == 401 ){
        refreshAccessToken()
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

function handleNextResponse(){
    if ( this.status == 200 ){
        document.getElementById("albumImage").src = nextAlbumImage;
        document.getElementById("songName").textContent = nextSongName;
        document.getElementById("artistName").textContent = nextArtistName;
        setTimeout(currentlyPlaying, 2500);
        getQueue();

    }
    else if ( this.status == 204 ){
        console.log("No track is currently playing.");
    }
    else if ( this.status == 401 ){
        console.log("Token expired. Refreshing...");
        refreshAccessToken()
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}

