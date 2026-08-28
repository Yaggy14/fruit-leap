// AdMob Monetization Manager (Placeholders ready for Google Play / Capacitor deployment & Web Simulation)
class AdMobManager {
    constructor() {
        // Official Google AdMob Test Unit IDs (Safe for testing without ban risk)
        this.adMobAppId = "ca-app-pub-3940256099942544~3347511713";
        this.rewardedAdUnitId = "ca-app-pub-3940256099942544/5224354917";
        this.interstitialAdUnitId = "ca-app-pub-3940256099942544/1033173712";
        this.bannerAdUnitId = "ca-app-pub-3940256099942544/6300978111";

        this.isPlayingAd = false;
        this.adDuration = 5; // 5-second realistic test ad duration
        this.timerInterval = null;
        this.rewardEarned = false;

        window.addEventListener('DOMContentLoaded', () => this.initDOM());
        // Also init immediately if DOM is already ready
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            this.initDOM();
        }
    }

    initDOM() {
        const closeBtn = document.getElementById('btn-admob-close');
        if (closeBtn && !this.hasBoundClose) {
            this.hasBoundClose = true;
            closeBtn.addEventListener('click', () => this.handleAdClose());
        }
    }

    // Show Rewarded Video Ad (User watches ad to earn +1 Life / Revive / 2X Score)
    showRewardedAd(onSuccess, onFailure) {
        if (this.isPlayingAd) return;
        console.log("🎬 [AdMob] Requesting Rewarded Video Ad...");

        // 1. Check for Native Capacitor / Cordova Plugin
        if (window.Capacitor && window.Capacitor.isPluginAvailable && window.Capacitor.isPluginAvailable('AdMob')) {
            console.log("📱 [Native AdMob] Launching Capacitor Rewarded Video...");
            if (onSuccess) onSuccess();
            return;
        }

        // 2. Interactive Web Simulated Ad Overlay
        this.showSimulatedRewardedAd(onSuccess, onFailure);
    }

    showSimulatedRewardedAd(onSuccess, onFailure) {
        this.initDOM();
        const overlay = document.getElementById('admob-test-overlay');
        const timerTxt = document.getElementById('admob-timer-txt');
        const closeBtn = document.getElementById('btn-admob-close');
        const progressBar = document.getElementById('admob-progress-bar');
        const statusLabel = document.getElementById('admob-status-label');

        if (!overlay) {
            if (onSuccess) onSuccess();
            return;
        }

        this.isPlayingAd = true;
        this.currentOnSuccess = onSuccess;
        this.currentOnFailure = onFailure;
        this.rewardEarned = false;

        overlay.classList.remove('hidden');
        if (closeBtn) closeBtn.classList.add('hidden');
        if (progressBar) {
            progressBar.style.transition = 'none';
            progressBar.style.width = '0%';
            void progressBar.offsetWidth;
            progressBar.style.transition = `width ${this.adDuration}s linear`;
            progressBar.style.width = '100%';
        }

        let timeLeft = this.adDuration;
        if (timerTxt) timerTxt.innerText = `Reward in ${timeLeft}s`;
        if (statusLabel) statusLabel.innerText = "📺 Ad is playing... Please wait for your reward.";

        if (this.timerInterval) clearInterval(this.timerInterval);

        this.timerInterval = setInterval(() => {
            timeLeft--;
            if (timeLeft > 0) {
                if (timerTxt) timerTxt.innerText = `Reward in ${timeLeft}s`;
            } else {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
                this.rewardEarned = true;

                if (timerTxt) timerTxt.innerHTML = "✅ REWARD UNLOCKED!";
                if (statusLabel) statusLabel.innerText = "🎉 Reward earned! Click ✕ to claim.";
                try { if (window.audio && audio.playWin) audio.playWin(); } catch (e) {}
                if (closeBtn) {
                    closeBtn.classList.remove('hidden');
                    closeBtn.focus();
                }
            }
        }, 1000);
    }

    handleAdClose() {
        try { if (window.audio && audio.playCoin) audio.playCoin(); } catch (e) {}
        const overlay = document.getElementById('admob-test-overlay');
        if (overlay) overlay.classList.add('hidden');

        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        this.isPlayingAd = false;

        if (this.rewardEarned) {
            console.log("✅ [AdMob] Rewarded Ad watched completely! Reward granted.");
            if (this.currentOnSuccess) {
                const cb = this.currentOnSuccess;
                this.currentOnSuccess = null;
                cb();
            }
        } else {
            console.log("❌ [AdMob] Ad skipped by user.");
            if (this.currentOnFailure) {
                const cb = this.currentOnFailure;
                this.currentOnFailure = null;
                cb();
            }
        }
    }

    // Show Interstitial Ad (Between Chapter/Level transitions)
    showInterstitialAd(onComplete) {
        console.log("📺 [AdMob] Triggering Interstitial Ad transition...");
        if (onComplete) onComplete();
    }
}

const admob = new AdMobManager();
