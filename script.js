// =====================================================
// PAGE READY
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {
        // alert("SCRIPT RUNNING");
        // =====================================================
        // SESSION
        // =====================================================

        let sessionId;

        if (
            window.crypto &&
            typeof window.crypto.randomUUID === "function"
        ) {

            sessionId =
                window.crypto.randomUUID();

        }

        else {

            sessionId =
                "session-" +
                Date.now() +
                "-" +
                Math.random()
                    .toString(36)
                    .substring(2, 10);

        }


        console.log(
            "SESSION ID:",
            sessionId
        );


        // =====================================================
        // ELEMENTS
        // =====================================================

        const introContent =
            document.getElementById("introContent");

        const authenticationContent =
            document.getElementById("authenticationContent");

        const transitionContent =
            document.getElementById("transitionContent");

        const worldContent =
            document.getElementById("worldContent");

        const startButton =
            document.getElementById("startButton");

        const keywordInput =
            document.getElementById("keywordInput");

        const keywordButton =
            document.getElementById("keywordButton");

        const keywordError =
            document.getElementById("keywordError");

        const cat =
            document.getElementById("cat");

        const catMessage =
            document.getElementById("catMessage");

        const catMessageText =
            document.getElementById("catMessageText");

        const storyMessage =
            document.getElementById("storyMessage");

        const storyMessageText =
            document.getElementById("storyMessageText");

        const storyChoices =
            document.getElementById("storyChoices");

        const choiceYes =
            document.getElementById("choiceYes");

        const choiceNo =
            document.getElementById("choiceNo");


        // =====================================================
        // ELEMENT CHECK
        // =====================================================

        console.log(
            "HTML elements loaded"
        );


        if (!startButton) {

            console.error(
                "startButton not found!"
            );

        }


        // =====================================================
        // EVENT TRACKING
        // =====================================================

        function trackEvent(
            eventName,
            data = {}
        ) {

            alert("TRACK EVENT: " + eventName);
            console.log(
                "TRACK EVENT:",
                eventName,
                data
            );

            fetch(
                "https://moon-page-production.up.railway.app/api/events",
                {
                    method: "POST",
            
                    headers: {
                        "Content-Type": "application/json"
                    },
            
                    body: JSON.stringify({
            
                        session_id: sessionId,
            
                        event_name: eventName,
            
                        data: data
            
                    })
                }
            )
            .then(
                response => {
            
                    alert(
                        "FETCH RESPONSE: " +
                        response.status
                    );
            
                    return response.text();
            
                }
            )
            .then(
                text => {
            
                    alert(
                        "SERVER RESPONSE: " +
                        text
                    );
            
                }
            )
            .catch(
                error => {
            
                    alert(
                        "FETCH ERROR: " +
                        error.name +
                        " / " +
                        error.message
                    );
            
                }
            );
            // fetch(
            //     "https://moon-page-production.up.railway.app/api/events",
            //     {
            //         method: "POST",

            //         headers: {
            //             "Content-Type": "application/json"
            //         },

            //         body: JSON.stringify({

            //             session_id:
            //                 sessionId,

            //             event_name:
            //                 eventName,

            //             data:
            //                 data

            //         })
            //     }
            // )
            .then(
                response => {

                    if (!response.ok) {

                        throw new Error(
                            `Event request failed: ${response.status}`
                        );

                    }

                    return response.json();

                }
            )
            .then(
                result => {

                    console.log(
                        "EVENT SAVED:",
                        result
                    );

                }
            )
            // .catch(
            //     error => {

            //         console.error(
            //             "EVENT TRACKING ERROR:",
            //             error
            //         );

            //     }
            // );
            .catch(
                error => {
            
                    console.error(
                        "EVENT TRACKING ERROR:",
                        error
                    );
            
                    alert(
                        "EVENT ERROR: " +
                        error.message
                    );
            
                }
            );
        }


        // =====================================================
        // PAGE VIEW
        // =====================================================

        alert("BEFORE PAGE VIEW");
        
        trackEvent(
            "page_view"
        );
        alert("AFTER PAGE VIEW");


        // =====================================================
        // مرحله اول
        // =====================================================

        if (startButton) {

            startButton.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    console.log(
                        "BUTTON CLICK"
                    );


                    trackEvent(
                        "start_journey_click"
                    );


                    console.log(
                        "AFTER TRACK EVENT"
                    );


                    console.log(
                        "BEFORE INTRO FADE"
                    );


                    introContent.style.transition =
                        "opacity .8s ease, transform .8s ease";

                    introContent.style.opacity =
                        "0";

                    introContent.style.transform =
                        "scale(.97)";


                    console.log(
                        "AFTER INTRO FADE"
                    );


                    setTimeout(
                        function () {

                            console.log(
                                "INSIDE SETTIMEOUT"
                            );


                            introContent.classList.add(
                                "hidden"
                            );


                            authenticationContent.classList.remove(
                                "hidden"
                            );


                            console.log(
                                "AUTHENTICATION SHOWN"
                            );


                            authenticationContent.style.opacity =
                                "0";

                            authenticationContent.style.transform =
                                "translateY(15px)";


                            requestAnimationFrame(
                                function () {

                                    console.log(
                                        "AUTH ANIMATION START"
                                    );


                                    authenticationContent.style.transition =
                                        "opacity .8s ease, transform .8s ease";

                                    authenticationContent.style.opacity =
                                        "1";

                                    authenticationContent.style.transform =
                                        "translateY(0)";


                                    console.log(
                                        "AUTH ANIMATION APPLIED"
                                    );

                                }
                            );


                            trackEvent(
                                "authentication_shown"
                            );


                            console.log(
                                "AFTER AUTH EVENT"
                            );

                        },
                        800
                    );

                }
            );

        }


        // =====================================================
        // بررسی کلید
        // =====================================================

        if (keywordButton) {

            keywordButton.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    checkKeyword();

                }
            );

        }


        if (keywordInput) {

            keywordInput.addEventListener(
                "keydown",
                function (event) {

                    if (event.key === "Enter") {

                        event.preventDefault();

                        checkKeyword();

                    }

                }
            );

        }


        // =====================================================
        // تابع بررسی کلمه
        // =====================================================

        function checkKeyword() {

            if (!keywordInput) {

                return;

            }


            const keyword =
                keywordInput.value.trim();


            trackEvent(
                "keyword_submitted",
                {
                    length:
                        keyword.length
                }
            );


            if (keyword === "") {

                keywordError.textContent =
                    ".یه کلمه رو وارد کن";

                return;

            }


            if (keyword === "نور") {

                keywordError.textContent =
                    "";


                trackEvent(
                    "authentication_success"
                );


                enterNewWorld();

            }

            else {

                keywordError.textContent =
                    ".نه... این اون کلمه‌ای نیست که دنبالشیم";


                trackEvent(
                    "authentication_failed"
                );


                keywordInput.value =
                    "";

                keywordInput.focus();

            }

        }


        // =====================================================
        // ورود به دنیای جدید
        // =====================================================

        function enterNewWorld() {

            authenticationContent.style.transition =
                "opacity .8s ease, transform .8s ease";

            authenticationContent.style.opacity =
                "0";

            authenticationContent.style.transform =
                "scale(.96)";


            setTimeout(
                function () {

                    authenticationContent.classList.add(
                        "hidden"
                    );


                    transitionContent.classList.remove(
                        "hidden"
                    );


                    transitionContent.style.opacity =
                        "0";

                    transitionContent.style.transform =
                        "scale(.95)";


                    requestAnimationFrame(
                        function () {

                            transitionContent.style.transition =
                                "opacity 1s ease, transform 1s ease";

                            transitionContent.style.opacity =
                                "1";

                            transitionContent.style.transform =
                                "scale(1)";

                        }
                    );


                    trackEvent(
                        "transition_started"
                    );


                    setTimeout(
                        function () {

                            enterWorld();

                        },
                        4500
                    );

                },
                800
            );

        }


        // =====================================================
        // ورود به دنیای اصلی
        // =====================================================

        function enterWorld() {

            transitionContent.style.transition =
                "opacity 1.2s ease, transform 1.2s ease";

            transitionContent.style.opacity =
                "0";

            transitionContent.style.transform =
                "scale(1.08)";


            setTimeout(
                function () {

                    transitionContent.classList.add(
                        "hidden"
                    );


                    worldContent.classList.remove(
                        "hidden"
                    );


                    trackEvent(
                        "main_world_entered"
                    );


                    setTimeout(
                        function () {

                            const worldText =
                                document.querySelector(
                                    ".world-content"
                                );


                            if (worldText) {

                                worldText.classList.add(
                                    "hide-text"
                                );

                            }


                            setTimeout(
                                function () {

                                    startCatSequence();

                                },
                                1200
                            );

                        },
                        4000
                    );

                },
                1200
            );

        }


        // =====================================================
        // شروع ورود گربه
        // =====================================================

        function startCatSequence() {

            const path =
                document.getElementById(
                    "catPath"
                );


            if (!cat || !path) {

                console.error(
                    "Cat or catPath not found!"
                );

                return;

            }


            trackEvent(
                "cat_appearing"
            );


            cat.classList.remove(
                "cat-start",
                "cat-idle",
                "cat-walking",
                "cat-attention",
                "cat-petted",
                "cat-happy",
                "cat-leaving",
                "cat-peek"
            );


            cat.style.animation =
                "none";

            cat.style.opacity =
                "0";


            const startPoint =
                path.getPointAtLength(0);


            const svg =
                path.ownerSVGElement;


            const matrix =
                svg.getScreenCTM();


            if (!matrix) {

                console.error(
                    "SVG matrix پیدا نشد"
                );

                return;

            }


            const screenPoint =
                new DOMPoint(
                    startPoint.x,
                    startPoint.y
                ).matrixTransform(
                    matrix
                );


            cat.style.left =
                `${screenPoint.x - cat.offsetWidth / 2}px`;


            cat.style.top =
                `${screenPoint.y - cat.offsetHeight + 15}px`;


            cat.classList.add(
                "cat-start"
            );


            cat.style.opacity =
                "1";


            setTimeout(
                function () {

                    cat.classList.add(
                        "cat-walking"
                    );


                    trackEvent(
                        "cat_started_walking"
                    );


                    moveCatAlongPath(
                        6500
                    );

                },
                500
            );

        }


        // =====================================================
        // حرکت گربه روی مسیر
        // =====================================================

        function moveCatAlongPath(
            duration = 6500
        ) {

            const path =
                document.getElementById(
                    "catPath"
                );


            if (!path || !cat) {

                return;

            }


            const pathLength =
                path.getTotalLength();


            const svg =
                path.ownerSVGElement;


            const startTime =
                performance.now();


            function animate(
                currentTime
            ) {

                const elapsed =
                    currentTime -
                    startTime;


                const progress =
                    Math.min(
                        elapsed / duration,
                        1
                    );


                const easedProgress =
                    1 -
                    Math.pow(
                        1 - progress,
                        3
                    );


                const point =
                    path.getPointAtLength(
                        pathLength *
                        easedProgress
                    );


                const matrix =
                    svg.getScreenCTM();


                if (!matrix) {

                    return;

                }


                const screenPoint =
                    new DOMPoint(
                        point.x,
                        point.y
                    ).matrixTransform(
                        matrix
                    );


                cat.style.left =
                    `${screenPoint.x - cat.offsetWidth / 2}px`;


                cat.style.top =
                    `${screenPoint.y - cat.offsetHeight + 15}px`;


                if (progress < 1) {

                    requestAnimationFrame(
                        animate
                    );

                }

                else {

                    cat.classList.remove(
                        "cat-walking"
                    );


                    cat.classList.add(
                        "cat-idle"
                    );


                    trackEvent(
                        "cat_reached_destination"
                    );


                    setTimeout(
                        function () {

                            showCatMessage();

                        },
                        700
                    );


                    setTimeout(
                        function () {

                            cat.classList.add(
                                "cat-attention"
                            );


                            trackEvent(
                                "cat_attention_started"
                            );

                        },
                        700
                    );

                }

            }


            requestAnimationFrame(
                animate
            );

        }


        // =====================================================
        // پیام اولیه گربه
        // =====================================================

        function showCatMessage() {

            if (!catMessage) {

                return;

            }


            catMessage.classList.remove(
                "hidden"
            );


            requestAnimationFrame(
                function () {

                    catMessage.classList.add(
                        "show"
                    );

                }
            );


            trackEvent(
                "cat_message_shown"
            );

        }


        // =====================================================
        // تعامل با گربه
        // =====================================================

        let catPetted =
            false;


        if (cat) {

            cat.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();


                    if (
                        !cat.classList.contains(
                            "cat-idle"
                        )
                    ) {

                        return;

                    }


                    if (catPetted) {

                        return;

                    }


                    catPetted =
                        true;


                    trackEvent(
                        "cat_petted"
                    );


                    cat.classList.remove(
                        "cat-idle",
                        "cat-attention"
                    );


                    cat.classList.add(
                        "cat-petted"
                    );


                    // ---------------------------------------------
                    // پیام گربه محو شود
                    // ---------------------------------------------

                    if (catMessage) {

                        catMessage.classList.remove(
                            "show"
                        );


                        setTimeout(
                            function () {

                                catMessage.classList.add(
                                    "hidden"
                                );

                            },
                            800
                        );

                    }


                    // ---------------------------------------------
                    // واکنش نوازش
                    // ---------------------------------------------

                    setTimeout(
                        function () {

                            cat.classList.remove(
                                "cat-petted"
                            );


                            cat.classList.add(
                                "cat-happy"
                            );


                            trackEvent(
                                "cat_happy"
                            );


                            // -----------------------------------------
                            // گربه شروع به خروج کند
                            // -----------------------------------------

                            setTimeout(
                                function () {

                                    makeCatLeave();

                                },
                                900
                            );

                        },
                        800
                    );

                }
            );

        }


        // =====================================================
        // خروج گربه از صفحه
        // =====================================================

        function makeCatLeave() {

            if (!cat) {

                return;

            }


            trackEvent(
                "cat_leaving"
            );


            cat.classList.remove(
                "cat-walking",
                "cat-idle",
                "cat-attention",
                "cat-petted",
                "cat-happy",
                "cat-peek"
            );


            const currentLeft =
                parseFloat(
                    cat.style.left
                ) || 0;


            const currentTop =
                parseFloat(
                    cat.style.top
                ) || 0;


            const targetLeft =
                window.innerWidth +
                cat.offsetWidth +
                100;


            const startTime =
                performance.now();


            const duration =
                6000;


            function animateCatLeave(
                currentTime
            ) {

                const elapsed =
                    currentTime -
                    startTime;


                const progress =
                    Math.min(
                        elapsed / duration,
                        1
                    );


                const eased =
                    1 -
                    Math.pow(
                        1 - progress,
                        3
                    );


                const newLeft =
                    currentLeft +
                    (
                        targetLeft -
                        currentLeft
                    ) *
                    eased;


                cat.style.left =
                    `${newLeft}px`;


                cat.style.top =
                    `${currentTop}px`;


                if (progress < 1) {

                    requestAnimationFrame(
                        animateCatLeave
                    );

                }

                else {

                    cat.style.left =
                        `${targetLeft}px`;


                    cat.style.opacity =
                        "0";


                    trackEvent(
                        "cat_left_screen"
                    );


                    setTimeout(
                        function () {

                            startStorySequence();

                        },
                        200
                    );

                }

            }


            requestAnimationFrame(
                animateCatLeave
            );

        }


        // =====================================================
        // داستان بعد از خروج گربه
        // =====================================================

        const storyMessages = [

            `
            ... بعضی مقصد هارو نمی‌شه یه‌شبه بهشون رسید <br>
            باید براشون قدم برداشت؛<br>
            ...قرار نبود رسیدن به نور آسون باشه
            `,


            `
            اگه انیشتین برای رسیدن به هدفش دست از تلاش می‌کشید؛<br>
            ...زندگی همه‌مون تیره و تاریک بود<br>
            منم دنبال نورم؛<br>
            🌙... ولی راستش من ماه رو می‌خوام 
            `,


            `
            می‌دونی سخت‌ ترین قسمت رسیدن به یه مقصد چیه؟ <br>
            `,


            `
             ... اینکه ندونی آخرش قراره بهش برسی یا نه<br>
            `,


            `
             ... ولی یه چیز رو خوب می‌دونم<br>
            `,


            `
            اگه چیزی واقعاً برات ارزش داشته باشه؛<br>
             .ارزش تلاش کردن رو داره<br>
           `,


           `
           ... شاید هنوز ندونی چرا این همه راه رو برات ساختم<br>
          `,


          `
          ...شاید حتی برات عجیب باشه که یکی برای یه نفر، این‌همه وقت و فکر گذاشته<br>
         `,


           `
           ،اما بعضی آدم‌ها <br>
           ،وقتی ارزششون رو بفهمی<br>
           دیگه نمی تونی به سادگی از کنارشون رد بشی
         `,


         `
         این همه راه رو باهم اومدیم <br>
         فقط برای اینکه آخرش ازت یه چیز کوچیک بخوام <br>
         میشه با هم صحبت کنیم؟<br>
         <br> Talk with me ... 🌙
         ... البته دو نفره <br>
          🐈😂 ! بدون خانم گربه
        `,

        ];


        // =====================================================
        // پیام‌های نهایی
        // =====================================================

        const finalMessages = {

            yes: `
                🌙 ماه <br><br>
                ممنونم که تا اینجا باهام اومدی .  <br>

                . راستش، خوشحالم که این قدم آخر رو باهام برداشتی <br>

                ... از اینجا به بعد دیگه نیاز به این صفحه نیست <br>

                خودم باهات ارتباط میگیرم <br>
                ...پس منتظرم باش.<br><br>

                : فعلاً فقط همین رو بدون که <br>

                🤍. از اینکه قراره بیشتر بشناسمت، خوشحالم
            `,

            no: `
                ،من تلاشم رو کردم<br><br>

                حرفم رو هم زدم<br>

                ... از اینجا به بعد، باقی راه با توئه<br>

                اگه یه نظرت تغییر کرد<br>

                !!فقط یه نشونه بهم بده<br>

                🌙 .من می‌فهمم
            `

        };


        // =====================================================
        // شروع داستان
        // =====================================================

        function startStorySequence() {

            if (
                !storyMessage ||
                !storyMessageText
            ) {

                return;

            }


            trackEvent(
                "story_sequence_started"
            );


            storyMessage.classList.remove(
                "hidden"
            );


            showStoryMessage(
                0
            );

        }


        // =====================================================
        // نمایش هر پیام
        // =====================================================

        function showStoryMessage(
            index
        ) {

            if (
                index >=
                storyMessages.length
            ) {

                finishStorySequence();

                return;

            }


            const message =
                storyMessages[index];


            storyMessageText.innerHTML =
                message;


            storyMessage.classList.remove(
                "show"
            );


            if (storyChoices) {

                storyChoices.classList.remove(
                    "show"
                );

                storyChoices.classList.add(
                    "hidden"
                );

            }


            requestAnimationFrame(
                function () {

                    storyMessage.classList.add(
                        "show"
                    );

                }
            );


            trackEvent(
                "story_message_shown",
                {
                    index:
                        index
                }
            );


            const visibleDuration =
                index === 0
                    ? 3500
                    : 4500;


            setTimeout(
                function () {

                    if (
                        index ===
                        storyMessages.length - 1
                    ) {

                        finishStorySequence();

                        return;

                    }


                    hideStoryMessage(
                        function () {

                            showStoryMessage(
                                index + 1
                            );

                        }
                    );

                },
                visibleDuration
            );

        }


        // =====================================================
        // محو کردن پیام
        // =====================================================

        function hideStoryMessage(
            callback
        ) {

            if (!storyMessage) {

                return;

            }


            storyMessage.classList.remove(
                "show"
            );


            setTimeout(
                function () {

                    if (callback) {

                        callback();

                    }

                },
                900
            );

        }


        // =====================================================
        // پایان داستان
        // =====================================================

        function finishStorySequence() {

            trackEvent(
                "story_sequence_finished"
            );


            setTimeout(
                function () {

                    showStoryChoices();

                },
                800
            );

        }


        // =====================================================
        // نمایش انتخاب‌ها
        // =====================================================

        function showStoryChoices() {

            if (!storyChoices) {

                return;

            }


            storyChoices.classList.remove(
                "hidden"
            );


            requestAnimationFrame(
                function () {

                    storyChoices.classList.add(
                        "show"
                    );

                }
            );


            trackEvent(
                "story_choices_shown"
            );


            trackEvent(
                "final_choice_shown"
            );

        }


        // =====================================================
        // نمایش پیام نهایی
        // =====================================================

        function showFinalMessage(
            choice
        ) {

            // دکمه‌ها محو شوند

            if (storyChoices) {

                storyChoices.classList.remove(
                    "show"
                );


                setTimeout(
                    function () {

                        storyChoices.classList.add(
                            "hidden"
                        );

                    },
                    800
                );

            }


            // پیام قبلی محو شود

            if (storyMessage) {

                storyMessage.classList.remove(
                    "show"
                );

            }


            // بعد از محو شدن پیام قبلی

            setTimeout(
                function () {

                    if (
                        !storyMessageText ||
                        !storyMessage
                    ) {

                        return;

                    }


                    storyMessageText.innerHTML =
                        finalMessages[choice];


                    storyMessage.classList.remove(
                        "hidden"
                    );


                    requestAnimationFrame(
                        function () {

                            storyMessage.classList.add(
                                "show"
                            );

                        }
                    );


                    trackEvent(
                        "final_message_shown",
                        {
                            choice:
                                choice
                        }
                    );

                },
                1000
            );


            setTimeout(
                function () {

                    if (storyMessage) {

                        storyMessage.classList.remove(
                            "show"
                        );

                    }


                    // افزایش نور ماه و آسمان

                    setTimeout(
                        function () {

                            const moon =
                                document.querySelector(
                                    ".moon-glow"
                                );


                            const sky =
                                document.querySelector(
                                    ".sky"
                                );


                            const stars =
                                document.querySelectorAll(
                                    ".stars"
                                );


                            if (moon) {

                                moon.classList.add(
                                    "final-glow"
                                );

                            }


                            if (sky) {

                                sky.classList.add(
                                    "final-sky"
                                );

                            }


                            stars.forEach(
                                function (star) {

                                    star.classList.add(
                                        "final-stars"
                                    );

                                }
                            );

                        },
                        1200
                    );


                    trackEvent(
                        "final_scene_started"
                    );

                },
                10000
            );


            setTimeout(
                function () {

                    const moon =
                        document.querySelector(
                            ".moon-glow"
                        );


                    if (moon) {

                        moon.classList.add(
                            "final-glow"
                        );

                    }

                },
                13000
            );

        }


        // =====================================================
        // FINAL ANSWER
        // =====================================================

        function submitFinalAnswer(
            answer
        ) {

            console.log(
                "FINAL ANSWER:",
                answer
            );

        }


        // =====================================================
        // YES BUTTON
        // =====================================================

        if (choiceYes) {

            choiceYes.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();


                    trackEvent(
                        "final_choice_made",
                        {
                            choice:
                                "yes"
                        }
                    );


                    showFinalMessage(
                        "yes"
                    );


                    submitFinalAnswer(
                        "yes"
                    );

                }
            );

        }


        // =====================================================
        // NO BUTTON
        // =====================================================

        if (choiceNo) {

            choiceNo.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();


                    trackEvent(
                        "final_choice_made",
                        {
                            choice:
                                "no"
                        }
                    );


                    showFinalMessage(
                        "no"
                    );


                    submitFinalAnswer(
                        "no"
                    );

                }
            );

        }


        // =====================================================
        // SCRIPT READY
        // =====================================================

        console.log(
            "Moon script initialized successfully 🌙"
        );

    }
);
