let currentSong = new Audio()
let currentSongIndex = 0;
currentSong.volume = 1; 
let currfolder
let songs;
function secondsToHMS(seconds) {
    seconds = Math.max(0, parseInt(seconds));

  // Calculate hours, minutes, and remaining seconds
  var hours = Math.floor(seconds / 3600);
  var minutes = Math.floor((seconds % 3600) / 60);
  var remainingSeconds = seconds % 60;

  // Format the result with leading zeros
  var formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;

  return formattedTime;
}



async function getSongs(folder) {
    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let response = await a.text();

    // Create a temporary div to parse the HTML content
    let div = document.createElement("div");
    div.innerHTML = response;

    // Get all anchor (a) elements
    let as = div.getElementsByTagName("a");

    songs = [];

    // Iterate over each link and check if it ends with ".mp3"
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3")) {
            // console.log(element.href);
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }
    

    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = ""
    for (const song of songs) {
        
        songUL.innerHTML += `<li><img class="invert" src="music.svg" alt="">
            <div class="info ">
                <div class="name">${song.replaceAll("%20"," ")}</div>
                <div class="artist">Sayan</div
            </div>  
            <div class="playnow flex">
                <span>Play Now</span>  
                <img class="invert playsign" src="play.svg" alt="">
            </div>
        </li>`
    }
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach((e) => {
       
       e.addEventListener("click", elements => {

        console.log(e.querySelector(".info").firstElementChild.innerHTML);
        Playmusic(e.querySelector(".info").firstElementChild.innerHTML)


       })
       
       

    })
}
function Playmusic(track){
    // let audio = new Audio("/songs/" + track)
    
    currentSong.src =  `/${currfolder}/` + track
    currentSong.play()
    document.querySelector(".songinfo").innerHTML = track
    
    document.querySelector(".songtime").innerHTML = "00:00:00 / 00:00:00"

    
    
}




async function main() {

    

    await getSongs("songs/ncs");
    // console.log(songs);

    //display all the albus
    
   

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "pause.svg";
        } else {
            currentSong.pause();
            play.src = "play.svg"; 
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToHMS(currentSong.currentTime)} / ${secondsToHMS(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });
    
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100  
    })
   
    document.querySelector("#next").addEventListener("click", () => {
        console.log("clicked next");
        // Increment the current song index
        currentSongIndex = (currentSongIndex + 1) % songs.length;
        console.log(songs);
    
        // Get the next song and play it
        const nextSong = songs[currentSongIndex].replaceAll("%20", " ");
         Playmusic(nextSong);
    });
    
    document.querySelector("#prev").addEventListener("click",  () => {
        console.log("clicked prev");
        // Decrement the current song index
        currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    
        // Get the previous song and play it
        const prevSong = songs[currentSongIndex].replaceAll("%20", " ");
         Playmusic(prevSong);
    });
    
    const volumeKnob = document.querySelector(".volume");

    volumeKnob.addEventListener("input", () => {
    // Adjust the volume of the current song based on the value of the volume knob
    currentSong.volume = volumeKnob.value;
});

Array.from(document.getElementsByClassName("card")).forEach(e => { 
    e.addEventListener("click", async item => {
        console.log("Fetching Songs");
        try {
            await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            
            // Play all songs in sequence
            for (const song of songs) {
                await new Promise(resolve => {
                    // Play the current song
                    Playmusic(song.replaceAll("%20"," "));
                    
                    // Wait for the 'ended' event to determine when the song finishes
                    currentSong.addEventListener("ended", () => {
                        resolve();
                    });
                });
            }
        } catch (error) {
            console.error("Error fetching songs:", error);
        }
    });
});

    
}

    

main();

