'use strict';

// lower-third.1.js

/*  Full graphic guide at
    https://app.gitbook.com/@chrisryanouellette/s/casparcg-html-template-guide
    Breaks down each section of code and lists all the necessary resouces
    to understand them.
    CasparCG Forum:  https://casparcgforum.org/
    CasparCG Wiki: https://github.com/CasparCG/help/wiki
*/

const graphic = (function() {
    let state = 0; // If the graphic is loaded, playable, or played
    let activeStep = 0; // What title the graphic is currently showing
    let currentStep = 0; // What title will be show once all anmaitions have completed
    let data = []; // The array of titles and subtitles
    let style; // The style object
    const animationQueue = []; // All the animtions that need to be ran
    const aniamtionThreshold = 3; // Max number of animations that can be in the que

    // Initlizes the graphic and attaches required CasparCG HTML template functions
    (function() {
        window['update'] = (raw) => update(raw);
        window['play'] = play;
        window['next'] = next;
        window['stop'] = stop;
        window['reset'] = reset;
        window['previous'] = previous;
        window['remove'] = remove;
    })();
    // Executes the first animation in the que
    function executePlayOutCommand() {
        animationQueue[0]().then(() => {
            animationQueue.splice(0, 1);
            if(animationQueue.length) executePlayOutCommand();
        }).catch(e => handleError(e));
    }
    // Appends a play out command to the animation queue.
    function addPlayOutCommand(prom) {
        if(animationQueue.length < aniamtionThreshold && prom) {
            animationQueue.push(prom);
            // Warn user about animation limit
            if(animationQueue.length === aniamtionThreshold) 
                handleWarning('Animation threshold met');
        }
        if(animationQueue.length === 1) executePlayOutCommand();
    }
    // Sets the title and subtitle to the DOM elements
    function applyData() {
        const graphic = document.querySelector('.lt-style-one .graphic');
        const title = graphic.querySelector('h1');
        const subtitle = graphic.querySelector('p');

        title.textContent = data[activeStep].title;
        subtitle.textContent = data[activeStep].subtitle;
    }
    // Sets the colors and position to the DOM elements
    function applyStyles() {
        const container = document.querySelector('.lt-style-one');
        const graphic = container.querySelector('.graphic');
        const [pathLeft, pathRight] = graphic.querySelectorAll('svg path');
        const title = graphic.querySelector('h1');
        const subtitle = graphic.querySelector('.subtitle');

        pathLeft.style.stroke = style.primaryColor;
        pathRight.style.stroke = style.primaryColor;
        title.style.color = style.textColor;
        subtitle.style.color = style.textColor;
        subtitle.style.backgroundColor = style.primaryColor;

        switch(style.position) {
            case 'left':
                container.style.marginRight = 'auto';
                break;
            case 'center':
                container.style.margin = '4vh auto';
                break;
            default:
                container.style.marginLeft = 'auto';
                break;
        }
    }
    // Gets a CSS property set on an DOM element that is not avaible via the style property
    // @param {DOM Node} elem - The element who's CSS properties you want to know
    // @param {string | string[]} styles - A list of requested styles
    // @returns {string[] | number[]} - An array of CSS values in the order they where passed in
    function getComputedStyle(elem, styles) {
        const computedStyles = window.getComputedStyle(elem);
        const values = [];
        if(Array.isArray(styles)) {
            styles.forEach(s => values.push(computedStyles.getPropertyValue(s)));
        } else {
            values.push(computedStyles.getPropertyValue(styles));
        }
        // Filter unwanted characters
        return values.map(v => {
            if(v.includes('px')) v = Number(v.substring(0, v.length - 2));
            return v;
        });
    }
    // Handles setting up and adding data to the graphic
    // @param {string} raw - The raw data sent from the CasparCG server
    function update(raw) {
        let parsed; 
        // Attempt to parse the data
        try {
            parsed = JSON.parse(raw);
            if(!Object.keys(parsed).length)
                throw new Error('Empty objects are not valid');
            if(!parsed.style) {
                if(!parsed.data) throw new Error('Invlaid data object');
            }
        } catch (error) {
            handleError(error);
            return;
        }
        // Add the data and set the style
        Array.isArray(parsed.data) 
            ? data = data.concat(parsed.data)
            : data.push(parsed.data);
        style = parsed.style;
        // If have not previously loaded, apply the data and styles
        if(state === 0) {
            try {
                applyData();
                applyStyles();
                state = 1; // Set the state to playable status
            } catch (error) {
                handleError(error);
                return;
            }
        }
    }
    // Animates the graphic onto the screen
    function animateIn() {
        return new Promise((resolve, reject) => {
            const graphic = document.querySelector('.lt-style-one .graphic');
            const [pathLeft, pathRight] = graphic.querySelectorAll('svg path');
            const title = graphic.querySelector('h1');
            const subtitleCon = graphic.querySelector('.subtitle');
            const subtitle = subtitleCon.querySelector('p');
            const titleWidgth = getComputedStyle(graphic, 'width')[0];
            const pathLength = titleWidgth * 2;
        
            
            const tl = new gsap.timeline({
                duration: 1, 
                ease: 'power1.out',
                onComplete: resolve
            });
            tl.set([pathLeft, pathRight], {strokeDashoffset: pathLength, strokeDasharray: pathLength})
                .set(title, {y: '15vh'})
                .set(subtitleCon, {y: '10vh'})
                .set(subtitle, {y: '20vh'})
                .set(graphic, {opacity: 1})
                .to([pathLeft, pathRight], {strokeDashoffset: 0, duration: 1.5})
                .to(title, {y: 0}, '-=1')
                .to(subtitleCon, {y: 0}, '-=.9')
                .to(subtitle, {y: 0}, '-=1');
        });  
    }
    // Handles if the graphic can be animated in or not
    function play() {
        if(state === 1) {
            addPlayOutCommand(animateIn);
            state = 2;
        }
    }
    // Handles if the graphic can be advanced or not
    function next() {
        if(state === 1) { // Graphic has not been played but is playable
            play();
        } else if(state === 2) { // Graphic has been played
            // If we are not at the end of the data array
            if(data.length > currentStep + 1) {
                currentStep++;
                const animation = () => animateOut().then(() => {
                    activeStep++;
                    applyData();
                    return;
                }).then(animateIn);
                addPlayOutCommand(animation);
            } else {
                handleError('Graphic is out of titles to display');
            }
        } else {
            handleError('Graphic cannot be advanced while in state ' + state);
        }
    }
    // Aniamtes the graphic off the screen
    function animateOut() {
        return new Promise((resolve, reject) => {
            /* Very simaliar as the animateIn function */
            const graphic = document.querySelector('.lt-style-one .graphic');
            const [pathLeft, pathRight] = graphic.querySelectorAll('svg path');
            const title = graphic.querySelector('h1');
            const subtitleCon = graphic.querySelector('.subtitle');
            const subtitle = subtitleCon.querySelector('p');
            const titleWidgth = getComputedStyle(graphic, 'width')[0];
            const pathLength = titleWidgth * 2;

            const tl = new gsap.timeline({
                duration: 1, 
                ease: 'power1.in',
                onComplete: resolve
            });
            tl.to(title, {y: '15vh'})
                .to(subtitleCon, {y: '10vh'}, '-=.75')
                .to(subtitle, {y: '20vh'}, '-=.55')
                .to([pathLeft, pathRight], {
                    strokeDashoffset: pathLength, 
                    ease: 'power1.inOut', 
                    duration: 2
                }, '-=1')
                .to(graphic, {opacity: 0}, '-=.25');
        });
    }
    // Determines if the graphic can be animated off or not
    function stop() {
        // State 2 means graphic is played and ready to be stopped
        if(state === 2) {
            addPlayOutCommand(animateOut);
            state = 1;
        }
    }
    // Resets the graphic back to the first title
    function reset() {
        if(currentStep === 0) { // If we are on the first title
            handleError('The graphic is already on its first item.');
            return;
        }
        let animation;
        if(state === 1) { // We are not showing the graphic
            currentStep = 0;
            animation = () => new Promise((resolve, reject) => {
                activeStep = 0;
                applyData();
                resolve();
            });
        } else if(state === 2) { // We are showing the graphic
            currentStep = -1;
            animation = () => new Promise((resolve, reject) => {
                activeStep = -1;
                resolve();
            }).then(next);
        } else {
            handleError('Cannot reset a graphic that has not been loaded.');
            return;
        }
        addPlayOutCommand(animation);
    }
    // Animates the graphic backwards one title
    function previous() {
        if(currentStep > 0) { // We are not on the first title
            let animation;
            if(state === 2) { // We are showing the graphic
                currentStep -= 2;
                animation = () => new Promise((resolve, reject) => {
                    activeStep -= 2;
                    resolve();
                }).then(next);
            } else if(state === 1) {  // We are not showing the graphic
                currentStep -= 1;
                animation = () => new Promise((resolve, reject) => {
                    activeStep -= 1;
                    applyData();
                    resolve();
                });
            } else {
                handleError('Graphic can not go back one title in the current state.');
                return;
            }
            addPlayOutCommand(animation);
        } else {
            handleError('There is no graphic to go backwards to.');
        }
    }
    // Animates the graphic out if it is visible
    async function remove() {
        if(state === 2) await animateOut();
    }
    // Logs errors to the console
    // @param {any} e - The error to be logged
    function handleError(e) {console.error(e)}
    // Logs a warning to the console
    // @param {any} w - The warning to be logged
    function handleWarning(w) {console.warn(w)}
    return { }
})();