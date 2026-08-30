// =====================================================
// PAGE READY
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        // =====================================================
        // PAGE OPEN SMS
        // =====================================================

        fetch(
            "https://moon-page-production.up.railway.app/send-page-open-sms",
            {
                method: "POST"
            }
        )
        .catch(
            function () {
                // SMS failure must never stop the experience.
            }
        );


        // =====================================================
        // VPN NOTICE MODAL
        // =====================================================

        const vpnModal =
            document.getElementById("vpnModal");

        const vpnModalButton =
            document.getElementById("vpnModalButton");


        if (
            vpnModal &&
            vpnModalButton
        ) {

            vpnModalButton.addEventListener(
                "click",
                function () {

                    vpnModal.classList.add(
                        "hide"
                    );

                    setTimeout(
                        function () {

                            vpnModal.remove();

                        },
                        600
                    );

                }
            );

        }


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

        } else {

            sessionId =
                "session-" +
                Date.now() +
                "-" +
                Math.random()
                    .toString(36)
                    .substring(2, 10);

        }


        // =====================================================
        // ELEMENTS
        // =====================================================

        const introContent =
            document.getElementById("introContent");

        const authenticationContent =
            document.getElementById(
                "authenticationContent"
            );

        const transitionContent =
            document.getElementById(
                "transitionContent"
            );

        const worldContent =
            document.getElementById(
                "worldContent"
            );

        const startButton =
            document.getElementById(
                "startButton"
            );

        const keywordInput =
            document.getElementById(
                "keywordInput"
            );

        const keywordButton =
            document.getElementById(
                "keywordButton"
            );

        const keywordError =
            document.getElementById(
                "keywordError"
            );

        const cat =
            document.getElementById(
                "cat"
            );

        const catMessage =
            document.getElementById(
                "catMessage"
            );

        const catMessageText =
            document.getElementById(
                "catMessageText"
            );

        const storyMessage =
            document.getElementById(
                "storyMessage"
            );

        const storyMessageText =
            document.getElementById(
                "storyMessageText"
            );

        const storyChoices =
            document.getElementById(
                "storyChoices"
            );

        const choiceYes =
            document.getElementById(
                "choiceYes"
            );

        const choiceNo =
            document.getElementById(
                "choiceNo"
            );


        // =====================================================
        // FINAL PHONE FORM
        // استفاده از فرم موجود در HTML
        // =====================================================

        const phoneForm =
            document.getElementById(
                "phoneForm"
            );

        const phoneInput =
            document.getElementById(
                "phoneInput"
            );

        const phoneSubmit =
            document.getElementById(
                "phoneSubmit"
            );

        const phoneError =
            document.getElementById(
                "phoneError"
            );


        // =====================================================
        // EVENT TRACKING
        // =====================================================

        function trackEvent(
            eventName,
            data = {}
        ) {

            const eventPayload = {

                session_id:
                    sessionId,

                event_name:
                    eventName,

                data:
                    data

            };


            const apiUrl =
                "https://moon-page-production.up.railway.app/api/events";


            fetch(
                apiUrl,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            eventPayload
                        ),

                    keepalive: true
                }
            )
            .then(
                function (response) {

                    if (!response.ok) {

                        throw new Error(
                            "HTTP " +
                            response.status
                        );

                    }

                }
            )
            .catch(
                function () {

                    try {

                        const blob =
                            new Blob(
                                [
                                    JSON.stringify(
                                        eventPayload
                                    )
                                ],
                                {
                                    type:
                                        "application/json"
                                }
                            );


                        navigator.sendBeacon(
                            apiUrl,
                            blob
                        );

                    }
                    catch (
                        error
                    ) {

                        // Tracking failure must never
                        // stop the experience.

                    }

                }
            );

        }


        // =====================================================
        // PAGE VIEW
        // =====================================================

        trackEvent(
            "page_view"
        );


        // =====================================================
        // مرحله اول
        // =====================================================

        if (startButton) {

            startButton.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();


                    trackEvent(
                        "start_journey_click"
                    );


                    introContent.style.transition =
                        "opacity .8s ease, transform .8s ease";

                    introContent.style.opacity =
                        "0";

                    introContent.style.transform =
                        "scale(.97)";


                    setTimeout(
                        function () {

                            introContent.classList.add(
                                "hidden"
                            );


                            authenticationContent.classList.remove(
                                "hidden"
                            );


                            authenticationContent.style.opacity =
                                "0";

                            authenticationContent.style.transform =
                                "translateY(15px)";


                            requestAnimationFrame(
                                function () {

                                    authenticationContent.style.transition =
                                        "opacity .8s ease, transform .8s ease";

                                    authenticationContent.style.opacity =
                                        "1";

                                    authenticationContent.style.transform =
                                        "translateY(0)";

                                }
                            );


                            trackEvent(
                                "authentication_shown"
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

                    if (
                        event.key === "Enter"
                    ) {

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


            if (
                !cat ||
                !path
            ) {

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


            if (
                !path ||
                !cat
            ) {

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
        // داستان
        // =====================================================

        const storyMessages = [

            `
            ... بعضی مقصد هارو نمی‌شه یه‌شبه بهشون رسید <br>
            باید براشون قدم برداشت؛<br>
            ...قرار نبود رسیدن به نور آسون باشه
            `,

            `
            اگه انیشتین برای رسیدن به هدفش دست از تلاش نمی‌کشید؛<br>
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
        `

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

            // =================================================
            // NO
            // =================================================

            if (choice === "no") {

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


                if (storyMessage) {

                    storyMessage.classList.remove(
                        "show"
                    );

                }


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


                return;

            }


            // =================================================
            // YES
            // =================================================

            if (choice === "yes") {

                // ---------------------------------------------
                // دکمه‌های انتخاب حذف شوند
                // ---------------------------------------------

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


                // ---------------------------------------------
                // پیام قبلی محو شود
                // ---------------------------------------------

                if (storyMessage) {

                    storyMessage.classList.remove(
                        "show"
                    );

                }


                // ---------------------------------------------
                // نمایش پیام YES
                // ---------------------------------------------

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


                        // -----------------------------------------
                        // نمایش فرم شماره
                        // -----------------------------------------

                        showFinalContactForm();

                    },
                    1000
                );

            }

        }


        // =====================================================
        // نمایش فرم شماره
        // =====================================================

        function showFinalContactForm() {

            if (
                !phoneForm ||
                !phoneInput ||
                !phoneSubmit
            ) {

                console.error(
                    "FINAL CONTACT FORM ELEMENTS NOT FOUND"
                );

                return;

            }


            // -------------------------------------------------
            // فرم از حالت hidden خارج شود
            // -------------------------------------------------

            phoneForm.classList.remove(
                "hidden"
            );


            // -------------------------------------------------
            // اطمینان از قابل کلیک بودن فرم
            // -------------------------------------------------

            phoneForm.style.pointerEvents =
                "auto";

            phoneForm.style.position =
                "relative";

            phoneForm.style.zIndex =
                "100";


            phoneInput.style.pointerEvents =
                "auto";

            phoneInput.style.position =
                "relative";

            phoneInput.style.zIndex =
                "101";

            phoneInput.disabled =
                false;

            phoneInput.readOnly =
                false;


            phoneSubmit.style.pointerEvents =
                "auto";

            phoneSubmit.style.position =
                "relative";

            phoneSubmit.style.zIndex =
                "101";

            phoneSubmit.disabled =
                false;


            // -------------------------------------------------
            // فوکوس
            // -------------------------------------------------

            setTimeout(
                function () {

                    phoneInput.focus();

                },
                300
            );


            // -------------------------------------------------
            // Event
            // -------------------------------------------------

            trackEvent(
                "contact_form_shown"
            );

        }


        // =====================================================
        // تبدیل اعداد فارسی و عربی به انگلیسی
        // =====================================================

        function normalizePhoneDigits(
            value
        ) {

            return value
                .replace(
                    /[۰-۹]/g,
                    function (digit) {

                        return String(
                            digit.charCodeAt(0) -
                            1776
                        );

                    }
                )
                .replace(
                    /[٠-٩]/g,
                    function (digit) {

                        return String(
                            digit.charCodeAt(0) -
                            1632
                        );

                    }
                );

        }


        // =====================================================
        // فرمت شماره
        // =====================================================

        function normalizePhone(
            value
        ) {

            let phone =
                normalizePhoneDigits(
                    value
                );


            // حذف فاصله و خط تیره و پرانتز
            phone =
                phone.replace(
                    /[\s\-()]/g,
                    ""
                );


            // -------------------------------------------------
            // +98
            // -------------------------------------------------

            if (
                phone.startsWith("+98")
            ) {

                phone =
                    "0" +
                    phone.substring(3);

            }


            // -------------------------------------------------
            // 0098
            // -------------------------------------------------

            else if (
                phone.startsWith("0098")
            ) {

                phone =
                    "0" +
                    phone.substring(4);

            }


            return phone;

        }


        // =====================================================
        // Submit Final Contact
        // =====================================================

        function submitFinalContact() {

            if (
                !phoneInput ||
                !phoneSubmit ||
                !phoneError
            ) {

                return;

            }


            let phone =
                normalizePhone(
                    phoneInput.value
                );


            // -------------------------------------------------
            // نمایش شماره نرمال‌شده
            // -------------------------------------------------

            phoneInput.value =
                phone;


            // -------------------------------------------------
            // Validation
            // -------------------------------------------------

            if (
                !/^09\d{9}$/.test(
                    phone
                )
            ) {

                phoneError.textContent =
                    "لطفاً یک شماره موبایل معتبر وارد کن.";


                phoneInput.focus();

                return;

            }


            // -------------------------------------------------
            // Loading
            // -------------------------------------------------

            phoneSubmit.disabled =
                true;

            phoneInput.disabled =
                true;

            phoneSubmit.textContent =
                "در حال ثبت...";

            phoneError.textContent =
                "";


            // -------------------------------------------------
            // Backend
            // -------------------------------------------------

            fetch(
                "https://moon-page-production.up.railway.app/api/final-contact",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            {
                                session_id:
                                    sessionId,

                                phone:
                                    phone
                            }
                        )
                }
            )
            .then(
                function (response) {

                    return response
                        .json()
                        .then(
                            function (data) {

                                return {
                                    ok:
                                        response.ok,

                                    data:
                                        data
                                };

                            }
                        );

                }
            )
            .then(
                function (result) {

                    if (
                        !result.ok ||
                        !result.data.success
                    ) {

                        throw new Error(
                            result.data.message ||
                            "ثبت شماره انجام نشد."
                        );

                    }


                    // -------------------------------------------------
                    // Event
                    // -------------------------------------------------

                    trackEvent(
                        "contact_submitted",
                        {
                            phone:
                                phone
                        }
                    );


                    // -------------------------------------------------
                    // Success
                    // -------------------------------------------------

                    phoneSubmit.textContent =
                        "ثبت شد ✓";


                    // -------------------------------------------------
                    // Fade form
                    // -------------------------------------------------

                    phoneForm.style.transition =
                        "opacity .8s ease, transform .8s ease";

                    phoneForm.style.opacity =
                        "0";

                    phoneForm.style.transform =
                        "translateY(-10px)";


                    // -------------------------------------------------
                    // Whole page fade
                    // -------------------------------------------------

                    setTimeout(
                        function () {

                            document.body.style.transition =
                                "opacity 1.8s ease";

                            document.body.style.opacity =
                                "0";

                        },
                        900
                    );


                    // -------------------------------------------------
                    // Final scene
                    // -------------------------------------------------

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


                            trackEvent(
                                "final_scene_started"
                            );

                        },
                        1200
                    );

                }
            )
            .catch(
                function (error) {

                    console.error(
                        "FINAL CONTACT ERROR:",
                        error
                    );


                    // -------------------------------------------------
                    // Restore
                    // -------------------------------------------------

                    phoneSubmit.disabled =
                        false;

                    phoneInput.disabled =
                        false;

                    phoneSubmit.textContent =
                        "تأیید 🌙";


                    phoneError.textContent =
                        "ارسال انجام نشد؛ دوباره امتحان کن.";


                    phoneInput.focus();

                }
            );

        }


        // =====================================================
        // اتصال دکمه فرم شماره
        // =====================================================

        if (phoneSubmit) {

            phoneSubmit.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();
                    event.stopPropagation();

                    submitFinalContact();

                }
            );

        }


        // =====================================================
        // ENTER داخل تکست‌باکس شماره
        // =====================================================

        if (phoneInput) {

            phoneInput.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key === "Enter"
                    ) {

                        event.preventDefault();
                        event.stopPropagation();

                        submitFinalContact();

                    }

                }
            );


            // -------------------------------------------------
            // فقط شماره
            // -------------------------------------------------

            phoneInput.addEventListener(
                "input",
                function () {

                    const normalized =
                        normalizePhoneDigits(
                            phoneInput.value
                        );


                    // اجازه اعداد + کاراکترهای لازم
                    phoneInput.value =
                        normalized.replace(
                            /[^0-9+]/g,
                            ""
                        );

                }
            );

        }


        // =====================================================
        // FINAL ANSWER
        // =====================================================

        function submitFinalAnswer(
            answer
        ) {

            // Reserved for future use.

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

    }
);
