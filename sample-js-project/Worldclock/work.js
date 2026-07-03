<script>
    // ==== which timezone is currently selected (shared by digital label + analog clock) ====
    let currentZone = "Asia/Kolkata";

    // ---- digital jumbotron time ----
    function updateTime() {
        const now = new Date();
        const timeString = now.toLocaleString("en-US", {
            timeZone: currentZone,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
        });
        document.getElementById("current-time").innerHTML = timeString;
    }

    // ---- analog clock hands (adapted from the original clock.js to respect currentZone) ----
    const secondHand = document.querySelector('.second-hand');
    const minsHand = document.querySelector('.min-hand');
    const hourHand = document.querySelector('.hour-hand');

    function setClockHands() {
        // get hour/minute/second for the selected timezone (not the browser's local time)
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: currentZone,
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: false
        }).formatToParts(new Date());

        const lookup = {};
        parts.forEach(p => lookup[p.type] = parseInt(p.value, 10));

        const hour = lookup.hour % 12;
        const mins = lookup.minute;
        const seconds = lookup.second;

        const secondsDegrees = ((seconds / 60) * 360) + 90;
        secondHand.style.transform = `rotate(${secondsDegrees}deg)`;

        const minsDegrees = ((mins / 60) * 360) + ((seconds / 60) * 6) + 90;
        minsHand.style.transform = `rotate(${minsDegrees}deg)`;

        const hourDegrees = ((hour / 12) * 360) + ((mins / 60) * 30) + 90;
        hourHand.style.transform = `rotate(${hourDegrees}deg)`;
    }

    function tick() {
        updateTime();
        setClockHands();
    }

    setInterval(tick, 1000);
    tick();

    // ---- city button clicks ----
    const buttons = document.querySelectorAll(".tz-btn");
    buttons.forEach(btn => {
        btn.addEventListener("click", function (e) {
            e.preventDefault();

            currentZone = this.getAttribute("data-zone");
            document.getElementById("current-zone-label").innerHTML = this.getAttribute("data-label");

            buttons.forEach(b => b.classList.remove("active"));
            this.classList.add("active");

            tick();
        });
    });
</script>