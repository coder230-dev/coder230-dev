let mainLoader = createSkylineLoader(document.querySelector('.container'), true);

const mainEl = document.getElementById('main-cont');
const asideBtns = document.querySelectorAll('.aside-btn');
const sectionScreens = document.querySelectorAll('.section-screen');

let bioData;

(async () => {
    bioData = await fetchJSONFile();

    createFeaturedCont();
    mainLoader();
    createSocialBtns();
    loadGolfScreen();
    loadAbout();
    loadMusic();

    document.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', (e) => {
            e.preventDefault();

            // Ignore clicks on buttons inside the link
            if (e.target.closest('button')) return;

            const loader = createSkylineLoader(document.body, true);

            setTimeout(() => {
                window.location.href = a.href;
                loader();
            }, 500);
        });
    });

    window.addEventListener('offline', () => {
        document.querySelector('.message-banner')?.remove();
        showMessageBanner('android_wifi_3_bar_off', 'No Internet has been Detected.', false, 'red')
    });

    window.addEventListener('online', () => {
        document.querySelector('.message-banner').remove();
        showMessageBanner('wifi', 'Your back online.', false, 'green');
        setTimeout(() => {
            document.querySelector('.message-banner').remove();
        }, 4000)
    });

    document.body.style.colorScheme = 'light dark';
})();

window.onload = () => {
    if (sessionStorage.getItem('lastOpenPage')) {
        openPage(sessionStorage.getItem('lastOpenPage'))
    }
}

const isMobile = /Mobi|Android/i.test(navigator.userAgent);

if (isMobile) {
    console.log("User is on a mobile device");
} else {
    console.log("User is on a desktop device");
}

document.addEventListener('DOMContentLoaded', () => {
    linkAsideBtns();
    window.scrollTo(0, 0)
})

let iconsUsed = [
    'open_in_new',
    'link',
    'touch_double',
    'arrow_right',
    'arrow_left',
    'feedback',
    'more_vert'
];

async function fetchJSONFile() {
    const CACHE_KEY = 'bio-data';
    const MAX_AGE = 1000 * 60 * 5; // 5 minutes

    const cached = sessionStorage.getItem(CACHE_KEY);

    if (cached) {
        const parsed = JSON.parse(cached);

        if (Date.now() - parsed.lastFetched < MAX_AGE) {
            return parsed;
        }
    }

    const res = await fetch(
        'https://raw.githubusercontent.com/coder230-dev/coder230-dev/refs/heads/main/pages/data/bioData.json',
        { cache: 'no-store' } // helps bypass GitHub caching
    );

    if (!res.ok) {
        console.error('Error fetching: ' + res.status);
        return cached ? JSON.parse(cached) : null;
    }

    const json = await res.json();
    json.lastFetched = Date.now();

    sessionStorage.setItem(CACHE_KEY, JSON.stringify(json));

    return json;
}


function openPage(page, btn = '') {
    if (document.querySelector('.popup-backdrop')) {
        document.querySelector('.popup-backdrop').remove();
    }

    const openScreen = document.querySelector('.section-screen.open');
    if (openScreen) openScreen.classList.remove('open');

    const activeBtn = document.querySelector('.aside-btn.active');
    if (activeBtn) activeBtn.classList.remove('active');

    const newScreen = document.querySelector(`#${page}-screen`);
    if (!newScreen) {
        const pop = showPopup(`
            <div class="popup-column-flex">
                <section class="header-center">
                <i translate="no" class="material-symbols-rounded head-icon">preview_off</i>
                <h1>This Page is Not Found.</h1>
                <p>Looks like you wandered into a page that doesn’t exist.</p>
                <p><em>No worries — it happens.</em></p>
                <p>Try jumping back to the sidebar or head home and you’ll be right where you need to be.</p>
            </section>
                <div class="button-pop-cont">
                <button dataset-primary onclick="openPage('overview')" class="popup-button">Go Back</button>
                </div>
            </div>
    `, mainEl, { styles: { position: 'absolute' } })
        console.log(pop);
    };

    newScreen.classList.add('open');

    if (!btn) {
        btn = document.querySelector(`.aside-btn[data-page="${page}"]`);
    }
    btn?.classList.add('active');

    sessionStorage.setItem('lastOpenPage', page);
}


function linkAsideBtns() {
    asideBtns.forEach(btn => {
        btn.onclick = () => openPage(btn.dataset.page, btn);
    });
}

function loadIcons() {
    let linkElement = document.getElementById('icon_href');
    iconsUsed.sort((a, b) => a.localeCompare(b));

    const listWithComma = iconsUsed
        .filter(icon => icon)
        .join(',');

    linkElement.href = `https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0&icon_names=${listWithComma}`;
}

function createFeaturedCont() {
    bioData.featured_content.forEach(content => {
        createCard(content);
    });
    bioData.featured_content = null;
}

function createSocialBtns() {
    const socialCont = document.getElementById('socials');
    const smallSocialCont = document.getElementById('socials-small-overview');

    if (bioData.socials) {
        bioData.socials.forEach(s => {
            // Creating the button
            let socBtn = document.createElement('a');
            socBtn.target = '_blank'
            socBtn.href = s.url;
            socBtn.className = 'wide-btn flex-3-sections';

            // Adding HTML
            socBtn.innerHTML = `
            <i translate="no" class="fa-brands fa-${s.icon}"></i>
            <section>
            <b class="platform-name">${s.label}</b>
            <p class="social-name">${s.username}</p>
            <div class="tags">
            ${createTags(s.tags)}
            </div>
            </section>
            <button class="material-symbols-rounded">
            more_vert
            </button>
            `

            socialCont.appendChild(socBtn);
            socBtn.querySelector('button').addEventListener('click', () => {
                let btn = socBtn.querySelector('button');
                createContextMenu([
                    {
                        innerHtml: `
                        <div style="background: var(--scheme-3); width: 100%; padding: 14px; border-radius: var(--radius)">
                        <b style="display: flex; align-items: center; gap: 7px;">
                        <i translate="no" class="material-symbols-rounded">page_info</i>
                        ${getBaseURL(btn.parentElement.href)}
                        </b>
                        <p style="margin: 0; padding: 0; display: flex; align-items: center; gap: 7px;">
                        <i translate="no" class="material-symbols-rounded">link</i>
                        ${btn.parentElement.href}
                        </p>
                        </div>`
                    },
                    {
                        icType: 'GF', icon: 'open_in_browser', name: 'Open & Replace this Page', function: () => {
                            openURL(btn.parentElement.href, '');
                        }
                    },
                    {
                        icType: 'GF', icon: 'open_in_new', name: 'Open in New Tab', function: () => {
                            openURL(btn.parentElement.href, '_blank');
                        }
                    }
                ], btn);
            });

            // Small social btns on overview
            const socialSmallTag = document.createElement('a');
            socialSmallTag.style.background = s.smallTag.bg || 'black';
            socialSmallTag.style.color = s.smallTag.txt || 'white';
            socialSmallTag.href = s.url;
            socialSmallTag.innerHTML = `
            <i translate="no" class="fa-brands fa-${s.icon}"></i>
            <p class="social-name">${s.username}</p>
            `
            smallSocialCont.appendChild(socialSmallTag);
        });

    } else {
        smallSocialCont.remove();
        loadNoContent('chat_dashed', `Looks like the socials data is not loading. Please try again later.`, socialCont);
    }
}

function loadAbout() {
    const cont = document.getElementById('about-me-populated-cont');

    if (bioData.about_me) {
        bioData.about_me.forEach(item => {
            cont.innerHTML += `
            <div class="aboutMe-section">
            ${item.header ? `<h2>${item.header}</h2>` : ''}
            <div>
            <p>${item.text}</p>
            <div class="about-img-holder">
            ${item.img ? `<img src="${item.img}">
            ` : ''}
            </div>
            </div>
            </div>
            
            `
        });
    } else {
        loadNoContent('person_alert', `About Me" page data seems like it's not responding. Try again in a little bit.`, cont);
    }

    if (!bioData.overviewBioInfo) {
        document.getElementById('overivew-content').innerHTML = `
            <div style="margin-bottom: 20px;" class="no-content">
                <i class="material-symbols-rounded no-content-logo">featured_play_list</i>
                <p>Any news from me will appear here.</p>
            </div>
            `
    } else {
        // For Overview Page
        bioData.overviewBioInfo.forEach(sect => {
            const newCard = document.createElement('div');
            if (sect.card === true) {
                newCard.innerHTML = `
                ${sect.img ? `<img src="${sect.img}" alt="${sect.header}">` : ''}
                <div class="content">
                <h2>${sect.header}</h2>
                <p>${sect.text}</p>
                </div>
                `;
                newCard.classList.add('card');

                if (sect.links) {
                    let linkNum = 0;

                    const contentDiv = newCard.querySelector('.content');

                    const container = document.createElement('div');
                    container.classList.add('button-container');

                    sect.links.forEach((link) => {
                        const isURL = !!link.url;

                        const btn = document.createElement(isURL ? 'a' : 'button');
                        btn.classList.add('action-btn');
                        if (linkNum === 0) btn.classList.add('primary');

                        btn.innerHTML = `
                        ${link.label}
                        <i class="material-symbols-rounded arrow">arrow_forward</i>
                        `;

                        if (isURL) { btn.href = link.url }

                        container.appendChild(btn);
                        linkNum++;
                    });

                    contentDiv.appendChild(container);
                }
            } else if (sect.mainHeader) {
                newCard.innerHTML = `
                <h1> <center>${sect.mainHeader}</center> </h1>
                <p><center>${sect.text}</center></p>
                `
            } else if (sect.header) {
                newCard.innerHTML = `
                <h2>${sect.header}</h2>
                <p>${sect.text}</p>
                `
            }
            document.getElementById('overivew-content').appendChild(newCard);
        });
    }

    const hobbiesContainer = document.getElementById('hobbies-cont');

    if (bioData.hobbiesInterests) {
        // Group hobbies by category (tag)
        const categories = {};

        bioData.hobbiesInterests.forEach(hobby => {
            if (!hobby.tags) return;

            hobby.tags.forEach(tag => {
                if (!categories[tag]) categories[tag] = [];
                categories[tag].push(hobby);
            });
        });

        // Render categories + hobby cards
        Object.keys(categories).forEach(category => {

            // Create category section
            const section = document.createElement('div');
            section.classList.add('hobby-category');
            section.innerHTML = `
                <h2 class="category-title">${category}</h2>
                <div class="hobby-list"></div>
            `;

            const list = section.querySelector('.hobby-list');

            categories[category].forEach(hobby => {
                const hobbyCard = document.createElement('div');
                hobbyCard.classList.add('hobby-card');

                hobbyCard.innerHTML = `
                    ${hobby.img ? `<img src="${hobby.img}" alt="${hobby.name}" class="hobby-img">` : ''}

                    <div class="hobby-content">
                        ${hobby.name ? `<h2 class="hobby-name">${hobby.name}</h2>` : ''}

                        ${hobby.desc ? `<p class="hobby-desc">${hobby.desc}</p>` : ''}

                        ${hobby.tags && hobby.tags.length > 0 ? `
                            <div class="tags">
                                ${hobby.tags.map(tag =>
                    `<span class="tag">${tag}</span>`
                ).join('')}
                        </div>
                ` : ''}

                ${hobby.url ? `
                    <a href="${hobby.url}">
                        Visit
                        <i class="material-symbols-rounded arrow">arrow_forward</i>
                    </a>
                ` : ''}
            </div>
        `;

                list.appendChild(hobbyCard);
            });

            hobbiesContainer.appendChild(section);
        });
    } else {
        loadNoContent('psychology_alt', "Looks like content hasn't loaded yet.", hobbiesContainer)
    }
}


function loadMusic() {
    const musicInfo = bioData.music;
    const musicOfTheWeekCont = document.getElementById('song-of-the-week');
    const musicCont = document.getElementById('top-music');

    if (musicInfo.songs) {
        bioData.music.songs.forEach(song => {
            musicCont.innerHTML += `
                <iframe style="border-radius:12px"
                    src="${song}"
                    width="100%" height="352"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy">
                </iframe>
                `
        });
    }

    if (!musicInfo || !musicInfo.musicOfTheWeek) {
        loadNoContent('music_note', 'Looks like there may be no music of the week at this moment. :(', musicOfTheWeekCont);
        loadNoContent('warning', "Couldn't get data from server. Please try again later.", musicCont);
    }

    const songs = bioData.music.musicOfTheWeek;

    validateSongs(songs);

    const song = getSongForThisWeek(songs);

    if (!song) {
        loadNoContent('music_note', 'Looks like there may be no music of the week at this moment. :(', musicOfTheWeekCont);
        return;
    }

    // Render Song of the Week
    musicOfTheWeekCont.innerHTML = `
        <iframe style="border-radius:12px"
            src="${song.embedUrl}"
            width="100%" height="352"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy">
        </iframe>

        ${song.desc ? `<p>${song.desc}</p>` : ''}
    `;
}


function loadGolfScreen() {
    const golfCont = document.getElementById('courses-displayed');
    const futureCont = document.getElementById('future-courses');

    if (bioData.golf_courses) {
        bioData.golf_courses.played.forEach(course => {
            const card = document.createElement('div');
            card.classList.add('course-card');
            card.innerHTML = `
            <div>
            <div class="course-img-handle">
            <img src="${course.imageHeader}" alt="${course.name}">
            </div>
            <div class="course-details">
            <h2>${course.name}</h2>
            <p style="opacity: 0.8"><i class="material-symbols-rounded">location_on</i> ${course.cityState}</p>
            <p style="opacity: 0.7">${course.locationDet}</p>
            <div class="course-opinion-sect">
            <p style="margin-top: 5px; text-align: left;">${course.opinion}</p>
            <span class="seperator"></span>
            <p class="course-rating" style="margin-top: 5px;"><i class="material-symbols-rounded">${course.rating > 8 ? (course.rating > 9.5 ? 'trophy' : 'award_star') : 'star'}</i> ${course.rating}</p>
            </div>
            </div>
            </div>
            <a class="course-link" href="${course.golfCourseLink}" target="_blank" rel="noopener noreferrer">Golf Course Website</a>
            `
            golfCont.appendChild(card);
        });
    } else {
        loadNoContent('strategy', `Looks like there is an outage while loading data. Try again later.`, golfCont);
    }

    if (bioData.golf_courses.future) {
        bioData.golf_courses.future.forEach(course => {
            const card = document.createElement('div');
            card.classList.add('course-card');
            card.innerHTML = `
            <div>
            <div class="course-img-handle">
            <img src="${course.imageHeader}" alt="${course.name}">
            </div>
            <div class="course-details">
            <h2>${course.name}</h2>
            <p style="opacity: 0.8"><i class="material-symbols-rounded">location_on</i> ${course.cityState}</p>
            <p style="opacity: 0.7">${course.locationDet}</p>
            ${course.opinion ? `<p style="margin-top: 5px; text-align: left;">${course.opinion}</p>` : ''}
            </div>
            </div>
            <a class="course-link" href="${course.golfCourseLink}" target="_blank" rel="noopener noreferrer">Golf Course Website</a>
            `
            futureCont.appendChild(card);
        });
    } else {
        loadNoContent('sports_golf', "It looks like I've played at all golf courses in my wish list.", futureCont)
    }
}


function openURL(url, target) {
    let a = document.createElement('a')
    a.href = url;
    a.target = target;
    a.rel = 'noreferer';
    document.body.appendChild(a);
    a.click();
    a.remove();
}

function createTags(tagArray = "") {
    let html = '';
    tagArray.forEach(tag => {
        html += `
            <span class="tag" style="background: ${tag.bg || 'black'}; color:${tag.color || 'white'}">
                ${tag.label || 'Unnamed Tag'}
            </span>
            `
    })
    return html;
}

function createCard(data) {
    const mainCont = document.getElementById('featured');

    // Creating the card
    let card = document.createElement('div');
    card.classList.add('card-in-feat');
    mainCont.appendChild(card);

    // Tags
    if (data.tags) {
        let tagCont = document.createElement('div');
        tagCont.className = 'tagCont';
        card.appendChild(tagCont);
        data.tags.forEach(tag => {
            let tagEl = document.createElement('div');
            tagEl.className = 'tag'
            tagEl.innerText = tag.label;
            tagEl.style.background = tag.color;
            tagCont.appendChild(tagEl);
        });
    }

    // Creating the h1
    let h1 = document.createElement('h1');
    h1.innerHTML = `<i translate="no" class="material-symbols-rounded" font-size: inherent;>${data.icon}</i> ${data.title}`;
    card.appendChild(h1);

    iconsUsed.push(data.icon);

    // Content
    let p = document.createElement('p');
    p.innerHTML = data.content;
    card.appendChild(p);

    if (data.links) {
        let linksCont = document.createElement('div');
        linksCont.className = 'linksCont';
        card.appendChild(linksCont);
        data.links.forEach(link => {
            let linkType = link.jsFunc && !link.url ? 'jsFunc' : 'url';

            let linkEl = document.createElement('a');
            linkEl.href = link.url
            linkEl.className = 'link';
            linkEl.title = link.url;
            linkEl.innerHTML = `
            <div class="linkHeader">
                <b>${link.label}</b>
                <i translate="no" class="material-symbols-rounded">${link.jsFunc ? 'touch_double' : 'open_in_new'}</i>
            </div>
            <p class="linkDesc">
                ${link.desc || linkType}
            </p>
            <p style="display: flex; align-items: center; gap: 7px;">
                <i translate="no" class="material-symbols-rounded">link</i>
                ${getBaseURL(link.url)}
            </p>
            <p>
                ${link.desc ? '' : linkType}
            </p>
            `
            linksCont.appendChild(linkEl);
        });
    }

    const next = document.createElement('button');
}

function createSkylineLoader(targetElement, withBackground = false) {
    // Create wrapper
    const wrapper = document.createElement("div");
    wrapper.className = "skyline-loader" + (withBackground ? " bg" : "");

    // Skyline HTML
    wrapper.innerHTML = `
      <div class="skyline">
        <div class="building b1"></div>
        <div class="building b2"></div>
        <div class="building b3"></div>
        <div class="building b4"></div>
        <div class="building b5"></div>
        <div class="beacon"></div>
      </div>
    `;

    targetElement.appendChild(wrapper);

    const skyline = wrapper.querySelector(".skyline");

    // Total rise animation time = last delay + animation duration
    const riseTime = (0.4 + 0.9) * 1000 + 1200;

    function runCycle() {
        // Reset classes
        skyline.classList.remove("flicker");

        // Restart rise animations by forcing reflow
        const buildings = skyline.querySelectorAll(".building");
        buildings.forEach(b => {
            b.style.animation = "none";
            void b.offsetWidth; // reflow
            b.style.animation = "";
        });

        // Flicker after rise finishes
        setTimeout(() => {
            skyline.classList.add("flicker");
        }, riseTime);
    }

    // Start loop
    runCycle();
    const interval = setInterval(runCycle, riseTime + 600);

    // Cleanup function
    return () => {
        clearInterval(interval);
        wrapper.remove();
    };
}

function getBaseURL(url) {
    try {
        const u = new URL(url);
        return `${u.protocol}//${u.hostname}`;
    } catch {
        return null; // invalid URL
    }
}

let activeMenuKeydownHandlers = new Set();

function createContextMenu(items = [], elementClicked = null, x = 0, y = 0, passThru = {}) {
    removeContextMenus();
    setTimeout(function () {
        elementClicked?.classList.add('hover-force');
    }, 100)

    setTimeout(() => {
        const backdrop = document.createElement('div');
        backdrop.classList.add('context-menu-backdrop');
        Object.assign(backdrop.style, {
            width: '100%',
            height: '100vh',
            left: '0',
            top: '0',
            position: 'fixed',
            zIndex: '999'
        });
        backdrop.onclick = removeContextMenus;
        backdrop.oncontextmenu = (e) => {
            e.preventDefault();
        };
        document.body.appendChild(backdrop);

        const contextMenu = document.createElement('div');
        contextMenu.classList.add('context-menu');
        // ensure menu is positioned fixed so we can place it anywhere on screen
        contextMenu.style.position = 'fixed';
        contextMenu.style.zIndex = '1000';
        document.body.appendChild(contextMenu);

        let top = y;
        let left = x;

        if (elementClicked) {
            const rect = elementClicked.getBoundingClientRect();
            // Position the menu below the clicked element by default
            top = rect.bottom + window.scrollY;
            left = rect.left + window.scrollX;
            console.log({ top, left })
        }

        // Start hidden to measure size and avoid flicker

        // Build items first so menu has size when we measure
        const buildItems = (list, parent) => {
            let currentCategory = null;

            list.forEach(({ icon, icType, name, shortcut, category, innerHtml, submenu, disabled, function: callback, id }) => {

                if (category && category !== currentCategory) {
                    currentCategory = category;
                    const catDiv = document.createElement('div');
                    catDiv.classList.add('context-menu-category');
                    catDiv.innerHTML = `<span>${category}</span>`;
                    parent.appendChild(catDiv);
                }

                const item = document.createElement('div');
                item.classList.add('context-menu-item');
                if (id) item.id = id;

                if (!innerHtml) {
                    if (icType === 'GF') icon = `<i translate="no" class="material-symbols-rounded">${icon}</i>`;
                    else if (icType === 'img') icon = `<i translate="no"mg src="${icon}">`;
                    else if (icType === 'FAb') icon = `<i translate="no" class="fa-brands fa-${icon}"></i>`;
                    else if (icType === 'FA') icon = `<i translate="no" class="fa-solid fa-${icon}"></i>`;

                    const leftSpan = document.createElement('span');
                    leftSpan.innerHTML = `${icon ? `<span class="icon" style="margin-right:6px">${icon}</span>` : ''}${name || ''}`;
                    item.appendChild(leftSpan);
                } else {
                    item.innerHTML = innerHtml;
                }

                if (submenu) {
                    const arrow = document.createElement('span');
                    arrow.textContent = '▶';
                    arrow.style.opacity = '0.6';
                    arrow.style.marginLeft = '8px';
                    item.appendChild(arrow);

                    if (callback) {
                        item.onclick = (e) => {
                            e.preventDefault();
                            callback?.(passThru);
                            removeContextMenus();
                        };
                    }

                    // Create submenu element appended to body so it can be positioned outside the button
                    const subMenu = document.createElement('div');
                    subMenu.classList.add('context-submenu');
                    subMenu.style.position = 'absolute';
                    subMenu.style.zIndex = '1001';
                    document.body.appendChild(subMenu);

                    // Build submenu items into the submenu element
                    buildItems(submenu, subMenu);

                    // Position submenu relative to the item on mouseenter
                    const positionSubmenu = () => {
                        const itemRect = item.getBoundingClientRect();
                        const subRect = subMenu.getBoundingClientRect();
                        const vw = window.innerWidth;
                        const vh = window.innerHeight;

                        // Default: place to the right of the item
                        let subLeft = itemRect.right + window.scrollX;
                        let subTop = itemRect.top + window.scrollY;

                        // If it would overflow right, place to the left of the item
                        if (subLeft + subRect.width > vw) {
                            subLeft = itemRect.left + window.scrollX - subRect.width;
                        }

                        // If it would overflow bottom, shift up
                        if (subTop + subRect.height > vh) {
                            subTop = Math.max(0, vh - subRect.height);
                        }

                        // If it would overflow top, clamp
                        if (subTop < 0) subTop = 0;

                        subMenu.style.left = `${Math.max(0, subLeft)}px`;
                        subMenu.style.top = `${Math.max(0, subTop)}px`;
                    };

                    let enterTimeout = null;

                    item.addEventListener('mouseenter', () => {
                        requestAnimationFrame(positionSubmenu)
                        // small delay to avoid accidental opens
                        clearTimeout(enterTimeout);
                        enterTimeout = setTimeout(() => {
                            positionSubmenu();
                            subMenu.style.opacity = '1';
                            subMenu.style.pointerEvents = 'auto';
                        }, 50);
                    });

                    item.addEventListener('mouseleave', () => {
                        clearTimeout(enterTimeout);
                        // small delay to allow moving into submenu
                        setTimeout(() => {
                            // If mouse is not over submenu, hide it
                            const overSub = document.querySelector(':hover') === subMenu || subMenu.matches(':hover');
                            if (!overSub) {
                                subMenu.style.opacity = '0';
                                subMenu.style.pointerEvents = 'none';
                            }
                        }, 100);
                    });

                    // Keep submenu visible while hovering it
                    subMenu.addEventListener('mouseenter', () => {
                        clearTimeout(enterTimeout);
                        subMenu.style.opacity = '1';
                        subMenu.style.pointerEvents = 'auto';
                    });
                    subMenu.addEventListener('mouseleave', () => {
                        subMenu.style.opacity = '0';
                        subMenu.style.pointerEvents = 'none';
                        subMenu.style.animationDirection = 'reverse';
                    });

                } else {
                    if (shortcut) {
                        const right = document.createElement('span');
                        right.classList.add('shortcut');
                        right.textContent = shortcut;
                        right.style.opacity = '0.6';
                        item.appendChild(right);

                        const handler = (e) => {
                            const combo = [];
                            if (e.ctrlKey || e.metaKey) combo.push('Ctrl');
                            if (e.altKey) combo.push('Alt');
                            if (e.shiftKey) combo.push('Shift');
                            combo.push(e.key.toUpperCase());

                            if (combo.join('+') === shortcut.toUpperCase()) {
                                e.preventDefault();
                                callback?.(passThru);
                                removeContextMenus();
                            }
                        };

                        window.addEventListener('keydown', handler);
                        window.activeMenuKeydownHandlers.add(handler);
                    }

                    item.addEventListener('click', (e) => {
                        e.stopPropagation();
                        callback?.(passThru);
                        removeContextMenus();
                    });
                }

                if (!disabled) parent.appendChild(item);
            });
        };

        // Build the menu items into the contextMenu element
        buildItems(items, contextMenu);

        // Now that items are built, measure and position the context menu
        requestAnimationFrame(() => {
            const menuRect = contextMenu.getBoundingClientRect();
            const vw = window.innerWidth;
            const vh = window.innerHeight;

            let originX = "left";
            let originY = "top";

            if (left + menuRect.width > vw) { left = Math.max(0, vw - menuRect.width); originX = "right" }
            if (top + menuRect.height > vh) { top = Math.max(0, vh - menuRect.height); originY = "bottom" }

            contextMenu.style.transformOrigin = `${originX} ${originY}`;
            contextMenu.style.top = `${Math.max(0, top)}px`;
            contextMenu.style.left = `${Math.max(0, left)}px`;
            contextMenu.classList.add('open');
        });

        // Global cleanup listeners
        setTimeout(() => {
            document.addEventListener('click', removeContextMenus);

            document.querySelectorAll('webview').forEach(webview => {
                try { webview.addEventListener('mousedown', removeContextMenus); } catch (e) { }
            });
        }, 0);
        document.querySelector('.context-menu-item')?.focus();
        return contextMenu;
    }, 50);
}

function removeContextMenus() {
    const menus = document.querySelectorAll('.context-menu, .context-submenu');

    menus.forEach(menu => {
        menu.remove();
    });

    // Remove hover-force safely
    const hover = document.querySelector('.hover-force');
    if (hover) hover.classList.remove('hover-force');

    // Remove backdrop immediately (or animate it too if you want)
    document.querySelectorAll('.context-menu-backdrop').forEach(b => b.remove());

    // Remove listeners
    document.removeEventListener('click', removeContextMenus);
    document.querySelectorAll('webview').forEach(w => {
        w.removeEventListener('mousedown', removeContextMenus);
    });

    for (const fn of activeMenuKeydownHandlers) {
        window.removeEventListener('keydown', fn);
    }
    activeMenuKeydownHandlers.clear();
}

function showPopup(content = "", target = document.body, opts = {}) {
    const { title = "", includeCloseBtn = false, titleIcon = "", styles = {} } = opts;

    const backdrop = document.createElement('div');
    backdrop.className = 'popup-backdrop';

    const pop = document.createElement('div');
    pop.classList.add('popup');
    backdrop.appendChild(pop);

    Object.assign(pop.style, styles);

    let closeFunc = () => {
        backdrop.remove(); // ✔ FIXED
    };

    if (title || includeCloseBtn) {
        const header = document.createElement('header');
        header.className = 'popup-header';
        pop.appendChild(header);

        if (title) {
            const titleEl = document.createElement('span');
            titleEl.innerHTML =
                `${titleIcon ? `<i translate="no" class="material-symbols-rounded">${titleIcon}</i>` : ""} <b>${title}</b>`;
            header.appendChild(titleEl);
        }

        if (includeCloseBtn) {
            const closeBtn = document.createElement('button');
            closeBtn.innerHTML = `<i class="material-symbols-rounded">close</i>`;
            closeBtn.classList.add('close-btn');

            closeBtn.onclick = () => {
                closeFunc();
            };

            header.appendChild(closeBtn);
        }
    }

    pop.addEventListener('animationend', () => {
        pop.style.animation = 'none';
    })

    if (typeof content === "string") {
        pop.insertAdjacentHTML("beforeend", content);
    } else {
        pop.appendChild(content);
    }
    target.appendChild(backdrop);

    return { backdrop, pop, closeFunc };
}

async function openReadMe() {
    let removeLoader = createSkylineLoader(mainEl, true);

    const readMe = await fetchReadMe();
    const parseReadMe = marked.parse(readMe);

    showPopup(parseReadMe, document.body, { includeCloseBtn: true, title: 'coder230-dev/README.md' });
    removeLoader();
}

async function fetchReadMe() {
    try {
        const res = await fetch('https://raw.githubusercontent.com/coder230-dev/coder230-dev/refs/heads/main/README.md');
        if (!res.ok) {
            throw new Error(`Error: ${(res.status)}`)
        }

        const data = res.text();
        return data;
    } catch (error) {
        console.log(error);
    }
}

function showMessageBanner(icon, content, showCloseBtn = false, bgColor = 'var(--scheme-1)') {
    if (!icon && !content) {
        return
    }
    const container = document.querySelector('.container');

    const messageBanner = document.createElement('div');
    messageBanner.classList.add('message-banner');
    messageBanner.style.background = `color-mix(in srgb, ${bgColor} 50%, transparent)`;
    messageBanner.innerHTML = `<i class="material-symbols-rounded">${icon}</i> <span>${content}</span>`;

    if (showCloseBtn) {
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = `
            <i class="material-symbols-rounded">close</i>
        `;
        closeBtn.classList.add('close-btn');
        messageBanner.appendChild(closeBtn);
    }
    container.appendChild(messageBanner);
}

function loadNoContent(icon, content, toElement = '') {
    if (!toElement) {
        return `
        <div class="no-content">
            <i class="material-symbols-rounded no-content-logo">${icon}}</i>
            <p>${content}</p>
        </div>
        `
    }

    toElement.innerHTML = `
        <div class="no-content">
            <i class="material-symbols-rounded no-content-logo">${icon}</i>
            <p>${content}</p>
        </div>
    `
}

// Music of the week function

function normalizeToMonday(dateStr) {
    const date = new Date(dateStr);
    const day = date.getUTCDay();

    if (day !== 1) {
        const original = dateStr;

        // Move forward to next Monday
        const diff = (1 - day + 7) % 7;
        date.setUTCDate(date.getUTCDate() + diff);

        const corrected = date.toISOString().split('T')[0];
        console.warn(`[MusicOfTheWeek] weekOf ${original} was not Monday → corrected to Monday ${corrected}`);
        return corrected;
    }

    return dateStr;
}

function validateSongs(songs) {
    const seenWeeks = new Set();

    songs.forEach(song => {
        if (!song.weekOf) {
            console.error("[MusicOfTheWeek] Missing weekOf:", song);
            return;
        }

        const normalized = normalizeToMonday(song.weekOf);

        if (seenWeeks.has(normalized)) {
            console.error(`[MusicOfTheWeek] Duplicate weekOf detected: ${normalized}`, song);
        } else {
            seenWeeks.add(normalized);
        }

        if (!song.embedUrl) console.error(`[MusicOfTheWeek] Missing embedUrl for week ${normalized}`);
    });
}

function getSongForThisWeek(songs) {
    const today = new Date();

    const monday = new Date(Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate() - (((today.getUTCDay() + 6) % 7))
    ));

    const mondayStr = monday.toISOString().split('T')[0];
    console.log(mondayStr);

    return songs.find(song => normalizeToMonday(song.weekOf) === mondayStr);
}