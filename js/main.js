(() => {
  const content = window.ANNIVERSARY_CONTENT;
  const $ = (s, p=document) => p.querySelector(s);
  const $$ = (s, p=document) => [...p.querySelectorAll(s)];

  // Ambient stars
  const stars = $("#stars");
  for (let i=0;i<75;i++) {
    const star=document.createElement("span");
    star.className="star-particle";
    star.style.left=Math.random()*100+"%";
    star.style.top=Math.random()*100+"%";
    star.style.animationDelay=(Math.random()*4)+"s";
    star.style.animationDuration=(2+Math.random()*4)+"s";
    stars.appendChild(star);
  }

  // Opening and music
  const opening=$("#opening"), music=$("#backgroundMusic"), musicToggle=$("#musicToggle"), vinyl=$("#vinyl");
  function setMusicUI(playing){
    musicToggle.classList.toggle("playing",playing);
    vinyl.classList.toggle("playing",playing);
    musicToggle.setAttribute("aria-label",playing?"Pause music":"Play music");
    $("#songPlayButton").textContent=playing?"Pause our song ♫":"Play our song ♫";
  }
  async function toggleMusic(){
    if(music.paused){
      try{await music.play();setMusicUI(true)}
      catch(e){showToast("Add ya-ahla-3yon.mp3 to assets/music to hear our song.")}
    }else{music.pause();setMusicUI(false)}
  }
  musicToggle.addEventListener("click",toggleMusic);
  $("#songPlayButton").addEventListener("click",toggleMusic);
  music.addEventListener("play",()=>setMusicUI(true));
  music.addEventListener("pause",()=>setMusicUI(false));
  $("#enterButton").addEventListener("click",async()=>{
    opening.classList.add("hidden");
    document.body.classList.remove("locked");
    $("#siteHeader").classList.add("visible");
    await toggleMusic();
    setTimeout(()=>$("#beginning").scrollIntoView({behavior:"smooth"}),500);
  });

  // Header and mobile navigation
  const header=$("#siteHeader"), nav=$("#mainNav"), menu=$("#menuToggle");
  const updateHeader=()=>header.classList.toggle("scrolled",window.scrollY>30);
  window.addEventListener("scroll",updateHeader,{passive:true});
  menu.addEventListener("click",()=>{
    const open=nav.classList.toggle("open");
    menu.setAttribute("aria-expanded",String(open));
  });
  $$("#mainNav a").forEach(a=>a.addEventListener("click",()=>{nav.classList.remove("open");menu.setAttribute("aria-expanded","false")}));

  // Scroll reveals
  const revealObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("visible");revealObserver.unobserve(entry.target)}});
  },{threshold:.12});
  $$(".reveal").forEach(el=>revealObserver.observe(el));

  // Build photo cards; missing local assets show a labelled placeholder instead of broken images.
  const allPhotos=[];

function makePhotoCard(item, index, kind) {
  const card = document.createElement("article");
  card.className = "photo-card";

  card.style.setProperty(
    "--tilt",
    `${(index % 2 === 0 ? -1 : 1) * (1 + index % 3 * 0.5)}deg`
  );

  const image = document.createElement("div");
  image.className = "photo-image";

  const img = document.createElement("img");
  img.src = item.src;
  img.alt = item.caption || "A memory";
  img.loading = "lazy";

  img.onload = () => {
    image.classList.add("loaded");
  };

  img.onerror = () => {
    console.error("Image not found:", item.src);
    image.innerHTML = `
      <div class="image-error">
        ✧<br>
        <small>Photo not found</small>
      </div>
    `;
  };

  image.appendChild(img);

  const caption = document.createElement("p");
  caption.className = "photo-caption";
  caption.textContent = item.caption || "A little memory";

  const date = document.createElement("p");
  date.className = "photo-date";
  date.textContent = item.date || "BEE & DODZ";

  card.append(image, caption, date);
  card.dataset.category = item.category || "all";

  card.addEventListener("click", () => {
    if (img.complete && img.naturalWidth > 0) {
      openLightbox(item, kind, index);
    } else {
      showToast(`Photo not found: ${item.src}`);
    }
  });

  allPhotos.push({ item, kind, index });
  return card;
}
  function renderGallery(target,items,kind){
    const el=$(target);el.innerHTML="";
    items.forEach((item,i)=>el.appendChild(makePhotoCard(item,i,kind)));
  }
  renderGallery("#hassanGallery",content.galleries.hassan,"hassan");
  renderGallery("#memoriesGallery",content.galleries.memories,"memories");
  renderGallery("#beeGallery",content.galleries.bee,"bee");

  // Memory filters
  $$("#memoryFilters button").forEach(btn=>btn.addEventListener("click",()=>{
    $$("#memoryFilters button").forEach(b=>b.classList.toggle("active",b===btn));
    const filter=btn.dataset.filter;
    $$("#memoriesGallery .photo-card").forEach(card=>{card.style.display=(filter==="all"||card.dataset.category===filter)?"":"none"});
  }));

  // Lightbox
  const lightbox=$("#lightbox"), lbImage=$("#lightboxImage"), lbCaption=$("#lightboxCaption");
  let currentSet=[],currentIndex=0;
  function openLightbox(item,kind,index){
    currentSet=content.galleries[kind];currentIndex=index;showLightboxItem();
    lightbox.classList.add("open");lightbox.setAttribute("aria-hidden","false");document.body.classList.add("locked");
  }
  function showLightboxItem(){const item=currentSet[currentIndex];lbImage.src=item.src;lbImage.alt=item.caption||"Memory";lbCaption.textContent=item.caption||""}
  function closeLightbox(){lightbox.classList.remove("open");lightbox.setAttribute("aria-hidden","true");document.body.classList.remove("locked")}
  $("#lightboxClose").addEventListener("click",closeLightbox);
  $("#lightboxPrev").addEventListener("click",()=>{currentIndex=(currentIndex-1+currentSet.length)%currentSet.length;showLightboxItem()});
  $("#lightboxNext").addEventListener("click",()=>{currentIndex=(currentIndex+1)%currentSet.length;showLightboxItem()});
  lightbox.addEventListener("click",e=>{if(e.target===lightbox)closeLightbox()});
  document.addEventListener("keydown",e=>{if(e.key==="Escape")closeLightbox();if(lightbox.classList.contains("open")&&e.key==="ArrowRight")$("#lightboxNext").click();if(lightbox.classList.contains("open")&&e.key==="ArrowLeft")$("#lightboxPrev").click()});

  // Relationship counter
  const start=new Date(content.relationshipStart);
  function updateCounter(){
    const now=new Date();let diff=Math.max(0,now-start);
    const days=Math.floor(diff/86400000);diff%=86400000;
    const hours=Math.floor(diff/3600000);diff%=3600000;
    const minutes=Math.floor(diff/60000);const seconds=Math.floor(diff%60000/1000);
    $("#daysCount").textContent=days.toLocaleString();
    $("#hoursCount").textContent=String(hours).padStart(2,"0");
    $("#minutesCount").textContent=String(minutes).padStart(2,"0");
    $("#secondsCount").textContent=String(seconds).padStart(2,"0");
  }
  updateCounter();setInterval(updateCounter,1000);

  // Reasons and constellation
  $("#reasonsButton").addEventListener("click",()=>{
    const out=$("#reasonsOutput");out.innerHTML="";
    content.reasons.forEach((reason,i)=>{const chip=document.createElement("span");chip.className="reason-chip";chip.textContent=reason;chip.style.animationDelay=(i*.12)+"s";out.appendChild(chip)});
  });
  $$(".constellation-star").forEach((star,i)=>star.addEventListener("click",()=>{
    const message=$("#starMessage");message.textContent=content.starMessages[i]||star.dataset.message;message.classList.add("show");
    clearTimeout(window.starMessageTimer);window.starMessageTimer=setTimeout(()=>message.classList.remove("show"),3500);
  }));

  // Envelope and letter
  const envelope=$("#envelopeButton"), letter=$("#letterContent");
  $("#letterText").textContent=content.letter;
  envelope.addEventListener("click",()=>{
    if(envelope.classList.contains("open"))return;
    envelope.classList.add("open");
    setTimeout(()=>{letter.classList.add("show");letter.setAttribute("aria-hidden","false");letter.scrollIntoView({behavior:"smooth",block:"center"})},950);
    $(".envelope-hint").textContent="A little something, from me to you.";
  });

  // Three-heart surprise
  let found=0;
  $$(".hidden-heart").forEach((heart,i)=>heart.addEventListener("click",()=>{
    if(heart.classList.contains("found"))return;
    heart.classList.add("found");heart.textContent="♥";found++;
    $("#heartProgress").textContent=found;
    const msg=$("#heartMessage");
    if(found<3)msg.textContent=content.secretMessages[i];
    else msg.textContent="You found all three. The best part of my story is still being written with you. I love you, Bee. ♥";
    if(found===3)showToast("You found all our little hearts, Bee. ♥");
  }));

  // Replay
  $("#replayButton").addEventListener("click",()=>{
    closeLightbox();$("#finale").scrollIntoView({behavior:"smooth"});
    window.scrollTo({top:0,behavior:"smooth"});
    opening.classList.remove("hidden");document.body.classList.add("locked");
    letter.classList.remove("show");letter.setAttribute("aria-hidden","true");envelope.classList.remove("open");
    $$(".hidden-heart").forEach(h=>{h.classList.remove("found");h.textContent="♡"});
    found=0;$("#heartProgress").textContent="0";$("#heartMessage").textContent="";
  });

  // Toast utility
  let toastTimer;
  function showToast(message){const toast=$("#toast");toast.textContent=message;toast.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove("show"),3000)}
  window.showAnniversaryToast=showToast;

  // Placeholder click feedback for any image placeholder

// Load the first and final anniversary photos
$$(".memory-placeholder").forEach(el => {
    const imagePath = el.dataset.file;

    if (!imagePath) return;

    const img = document.createElement("img");
    img.src = imagePath;
    img.alt = el.dataset.placeholder || "Our memory";
    img.className = "placeholder-photo";

    img.onload = () => {
        el.classList.add("photo-loaded");
        console.log("Photo loaded:", imagePath);
    };

    img.onerror = () => {
        console.error("Photo not found:", imagePath);
        showToast(`Photo not found: ${imagePath}`);
    };

    el.prepend(img);
});
  document.body.classList.add("locked");
})();
