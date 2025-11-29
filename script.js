class BuffonNeedleSimulation {
    constructor() {
        this.canvas = document.getElementById('simulationCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Simulation parameters
        this.lineSpacing = 100; // Distance between parallel lines
        this.needleLength = 50; // Default needle length (will be adjusted by slider)
        this.needles = [];
        this.totalDrops = 0;
        this.crossings = 0;
        this.maxVisibleNeedles = 400;
        
        // Animation parameters
        this.isRunning = false;
        this.animationSpeed = 5;
        this.animationId = null;
        this.dropCounter = 0;
        
        // Betting system
        this.bettingMode = false;
        this.activeBet = null;
        this.bettingBalance = 100;
        this.gamesWon = 0;
        this.convergenceTarget = 5; // target decimal places for convergence bets
        this.houseEdge = 0.1; // 10% house advantage baked into odds
        this.currentOdds = { yes: 1.0, no: 1.0 };
        this.currentProbabilities = { yes: 0.5, no: 0.5 };
        
        // Canvas setup
        this.setupCanvas();
        this.drawLines();
        
        // Event listeners
        this.setupEventListeners();
        
        // Initial stats update
        this.updateStats();
        this.updateBettingUI();
    }
    
    setupCanvas() {
        // Make canvas responsive
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        const maxWidth = Math.min(800, containerWidth - 40);
        
        this.canvas.width = maxWidth;
        this.canvas.height = Math.min(600, maxWidth * 0.75);
        
        // Set up coordinate system
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    setupEventListeners() {
        // Control buttons
        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pause());
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
        
        // Speed slider
        const speedSlider = document.getElementById('speedSlider');
        speedSlider.addEventListener('input', (e) => {
            this.animationSpeed = parseInt(e.target.value);
            document.getElementById('speedValue').textContent = e.target.value;
        });
        
        // Needle length slider
        const lengthSlider = document.getElementById('needleLength');
        lengthSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.needleLength = value * 50; // Scale for display
            document.getElementById('lengthValue').textContent = value.toFixed(1);
        });
        
        // Betting mode controls
        document.getElementById('betModeBtn').addEventListener('click', () => this.toggleBetMode());
        document.getElementById('betYesBtn').addEventListener('click', () => this.placeBet(true));
        document.getElementById('betNoBtn').addEventListener('click', () => this.placeBet(false));
        
        // Betting input listeners
        document.getElementById('betAmount').addEventListener('input', () => this.updateOdds());
        document.getElementById('targetThrows').addEventListener('input', () => this.updateOdds());
        
        // Window resize
        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.redraw();
        });
    }
    
    drawLines() {
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        
        // Draw parallel lines
        const numLines = Math.ceil(this.canvas.width / this.lineSpacing) + 1;
        
        for (let i = 0; i <= numLines; i++) {
            const x = i * this.lineSpacing;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
    }
    
    dropNeedle() {
        // Random position of the needle's center and orientation
        const halfLength = this.needleLength / 2;
        const x = Math.random() * this.canvas.width;
        const y = Math.random() * this.canvas.height;
        const angle = Math.random() * Math.PI; // 0 to π radians
        
        // Calculate needle endpoints for rendering
        const x1 = x - halfLength * Math.cos(angle);
        const y1 = y - halfLength * Math.sin(angle);
        const x2 = x + halfLength * Math.cos(angle);
        const y2 = y + halfLength * Math.sin(angle);
        
        // Determine distance from the needle's center to the nearest vertical line
        const mod = x % this.lineSpacing;
        const distanceToNearestLine = Math.min(mod, this.lineSpacing - mod);
        
        // A crossing occurs if the projected half-length perpendicular to the lines exceeds the distance
        const perpendicularProjection = halfLength * Math.abs(Math.sin(angle));
        const crosses = perpendicularProjection >= distanceToNearestLine;
        
        // Store needle data
        const needle = {
            x1, y1, x2, y2,
            crosses,
            opacity: 1
        };
        
        this.needles.push(needle);
        this.totalDrops++;
        
        if (crosses) {
            this.crossings++;
        }
        
        return needle;
    }
    
    drawNeedle(needle, opacity) {
        this.ctx.save();
        
        // Set color based on crossing status
        if (needle.crosses) {
            this.ctx.strokeStyle = `rgba(244, 67, 54, ${opacity})`; // Red for crossing
        } else {
            this.ctx.strokeStyle = `rgba(76, 175, 80, ${opacity})`; // Green for non-crossing
        }
        
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = 'round';
        
        // Draw needle
        this.ctx.beginPath();
        this.ctx.moveTo(needle.x1, needle.y1);
        this.ctx.lineTo(needle.x2, needle.y2);
        this.ctx.stroke();
        
        // Draw small circles at endpoints
        this.ctx.fillStyle = this.ctx.strokeStyle;
        this.ctx.beginPath();
        this.ctx.arc(needle.x1, needle.y1, 2, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(needle.x2, needle.y2, 2, 0, 2 * Math.PI);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    redraw() {
        // Clear canvas
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Redraw lines
        this.drawLines();
        
        // Draw only recent needles for performance while maintaining full history
        const startIndex = Math.max(0, this.needles.length - this.maxVisibleNeedles);
        const totalNeedles = this.needles.length;
        
        for (let i = startIndex; i < totalNeedles; i++) {
            const needle = this.needles[i];
            const age = totalNeedles - i;
            const opacity = Math.max(0.15, 1 - age / this.maxVisibleNeedles);
            this.drawNeedle(needle, opacity);
        }
    }
    
    animate() {
        if (!this.isRunning) return;
        
        // Drop multiple needles based on speed
        for (let i = 0; i < this.animationSpeed; i++) {
            this.dropNeedle();
        }
        
        // Redraw scene
        this.redraw();
        
        // Update statistics
        this.updateStats();
        
        // Check betting conditions
        if (this.activeBet) {
            this.checkBetStatus();
        }
        
        // Continue animation
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    updateStats() {
        document.getElementById('totalNeedles').textContent = this.totalDrops;
        document.getElementById('crossingNeedles').textContent = this.crossings;
        
        if (this.crossings > 0 && this.totalDrops > 0) {
            // Calculate π estimate using Buffon's formula
            // π ≈ (2 * L * N) / (D * C)
            // where L = needle length, N = total drops, D = line spacing, C = crossings
            const L = this.needleLength;
            const D = this.lineSpacing;
            const N = this.totalDrops;
            const C = this.crossings;
            
            const piEstimate = (2 * L * N) / (D * C);
            const error = Math.abs((piEstimate - Math.PI) / Math.PI * 100);
            
            document.getElementById('piEstimate').textContent = piEstimate.toFixed(6);
            document.getElementById('error').textContent = error.toFixed(2) + '%';
        } else {
            document.getElementById('piEstimate').textContent = '0';
            document.getElementById('error').textContent = '0%';
        }

        if (this.bettingMode) {
            this.updateOdds();
        }
    }
    
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        document.getElementById('startBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;
        
        this.animate();
    }
    
    pause() {
        this.isRunning = false;
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    reset() {
        this.pause();
        
        // Reset simulation data
        this.needles = [];
        this.totalDrops = 0;
        this.crossings = 0;
        
        // Redraw clean canvas
        this.redraw();
        
        // Update stats
        this.updateStats();
    }
    
    // Betting system methods
    toggleBetMode() {
        this.bettingMode = !this.bettingMode;
        const panel = document.getElementById('betPanel');
        const bettingStats = document.querySelectorAll('.betting-stats');
        
        if (this.bettingMode) {
            panel.classList.remove('hidden');
            bettingStats.forEach(stat => stat.style.display = 'flex');
            document.getElementById('betModeBtn').textContent = 'Exit Bet Mode';
            document.getElementById('betModeBtn').classList.add('active');
            const digitsLabel = this.convergenceTarget === 1 ? 'digit' : 'digits';
            document.getElementById('betYesBtn').textContent = `Bet YES (Reach ${this.convergenceTarget} ${digitsLabel})`;
            document.getElementById('betNoBtn').textContent = `Bet NO (Miss ${this.convergenceTarget} ${digitsLabel})`;
            document.getElementById('betTargetDigits').textContent = this.convergenceTarget;
            this.updateOdds();
        } else {
            panel.classList.add('hidden');
            bettingStats.forEach(stat => stat.style.display = 'none');
            document.getElementById('betModeBtn').textContent = 'Bet Mode';
            document.getElementById('betModeBtn').classList.remove('active');
            this.cancelActiveBet();
        }
    }
    
    updateOdds() {
        const targetThrowsInput = document.getElementById('targetThrows');
        const betAmountInput = document.getElementById('betAmount');

        if (!targetThrowsInput || !betAmountInput) {
            return;
        }

        const targetThrows = Math.max(1, parseInt(targetThrowsInput.value, 10) || 0);
        const betAmount = Math.max(0, parseFloat(betAmountInput.value) || 0);
        const metrics = this.calculateConvergenceProbability(targetThrows);

        this.currentProbabilities = {
            yes: metrics.yesProbability,
            no: metrics.noProbability
        };

        this.currentOdds = {
            yes: metrics.yesOdds,
            no: metrics.noOdds
        };

        const yesProbabilityText = Number.isFinite(metrics.yesProbability)
            ? `${(metrics.yesProbability * 100).toFixed(1)}%`
            : '--';
        const noProbabilityText = Number.isFinite(metrics.noProbability)
            ? `${(metrics.noProbability * 100).toFixed(1)}%`
            : '--';

        const yesOddsText = Number.isFinite(metrics.yesOdds) ? `1:${metrics.yesOdds.toFixed(2)}` : '1:--';
        const noOddsText = Number.isFinite(metrics.noOdds) ? `1:${metrics.noOdds.toFixed(2)}` : '1:--';

        const yesPayoutValue = betAmount * (Number.isFinite(metrics.yesOdds) ? metrics.yesOdds : 0);
        const noPayoutValue = betAmount * (Number.isFinite(metrics.noOdds) ? metrics.noOdds : 0);

        const yesPayoutText = Number.isFinite(yesPayoutValue) ? `$${yesPayoutValue.toFixed(2)}` : '$0.00';
        const noPayoutText = Number.isFinite(noPayoutValue) ? `$${noPayoutValue.toFixed(2)}` : '$0.00';

        const yesProbabilityEl = document.getElementById('probabilityYes');
        const noProbabilityEl = document.getElementById('probabilityNo');
        const yesOddsEl = document.getElementById('yesOdds');
        const noOddsEl = document.getElementById('noOdds');
        const yesPayoutEl = document.getElementById('yesPayout');
        const noPayoutEl = document.getElementById('noPayout');

        if (yesProbabilityEl) yesProbabilityEl.textContent = yesProbabilityText;
        if (noProbabilityEl) noProbabilityEl.textContent = noProbabilityText;
        if (yesOddsEl) yesOddsEl.textContent = yesOddsText;
        if (noOddsEl) noOddsEl.textContent = noOddsText;
        if (yesPayoutEl) yesPayoutEl.textContent = yesPayoutText;
        if (noPayoutEl) noPayoutEl.textContent = noPayoutText;
    }
    
    placeBet(bettingYes) {
        this.updateOdds();

        const betAmount = parseFloat(document.getElementById('betAmount').value);
            const targetThrowsInput = parseInt(document.getElementById('targetThrows').value, 10);
            const targetThrows = Math.max(1, Number.isFinite(targetThrowsInput) ? targetThrowsInput : 0);
        
        if (!Number.isFinite(betAmount) || betAmount <= 0) {
            alert('Enter a valid bet amount greater than zero.');
            return;
        }

            if (!Number.isFinite(targetThrowsInput) || targetThrowsInput <= 0) {
            alert('Enter a valid target throw count.');
            return;
        }

        if (betAmount > this.bettingBalance) {
            alert('Insufficient balance!');
            return;
        }
        
        if (this.activeBet) {
            alert('You already have an active bet!');
            return;
        }
        
        const odds = bettingYes ? this.currentOdds.yes : this.currentOdds.no;
        const probability = bettingYes ? this.currentProbabilities.yes : this.currentProbabilities.no;
        const payout = betAmount * odds;

        if (!Number.isFinite(odds) || odds < 1) {
            alert('Odds are not available right now. Please wait a moment and try again.');
            return;
        }
        
        this.activeBet = {
            amount: betAmount,
            targetThrows: targetThrows,
            bettingYes: bettingYes,
            odds: odds,
            probability: probability,
            potentialPayout: payout,
            startingThrows: this.totalDrops,
            converged: false,
            finished: false
        };
        
        // Deduct bet amount from balance
        this.bettingBalance -= betAmount;
        this.updateBettingUI();
        
        // Show active bet panel
        document.getElementById('activeBet').classList.remove('hidden');
        const digitsLabel = this.convergenceTarget === 1 ? 'digit' : 'digits';
        document.getElementById('betDirection').textContent = bettingYes ? `YES (Will converge to ${this.convergenceTarget} ${digitsLabel})` : `NO (Won't converge to ${this.convergenceTarget} ${digitsLabel})`;
        document.getElementById('activeBetAmount').textContent = betAmount.toFixed(2);
        document.getElementById('activeBetTarget').textContent = targetThrows;
        document.getElementById('activeBetOdds').textContent = `1:${odds.toFixed(2)}`;
        document.getElementById('activeBetProbability').textContent = `${(probability * 100).toFixed(1)}%`;
        document.getElementById('activeBetPayout').textContent = payout.toFixed(2);
        document.getElementById('targetCount').textContent = targetThrows;
        
        // Disable betting buttons
        document.getElementById('betYesBtn').disabled = true;
        document.getElementById('betNoBtn').disabled = true;
        
        // Start simulation if not running
        if (!this.isRunning) {
            this.start();
        }
    }
    
    checkBetStatus() {
        if (!this.activeBet || this.activeBet.finished) return;
        
        const throwsSinceBet = this.totalDrops - this.activeBet.startingThrows;
        const progress = Math.min(100, (throwsSinceBet / this.activeBet.targetThrows) * 100);
        
        // Update progress bar
        document.getElementById('progressFill').style.width = progress + '%';
        document.getElementById('throwCount').textContent = throwsSinceBet;
        
        // Check for convergence (5 decimal places accuracy)
        if (this.crossings > 0) {
            const L = this.needleLength;
            const D = this.lineSpacing;
            const N = this.totalDrops;
            const C = this.crossings;
            const piEstimate = (2 * L * N) / (D * C);
            
            const accuracy = this.calculateAccuracy(piEstimate);
            
            if (accuracy >= this.convergenceTarget && !this.activeBet.converged) {
                this.activeBet.converged = true;
                document.getElementById('convergenceStatus').textContent = `Converged! (${accuracy} digits)`;
                document.getElementById('convergenceStatus').style.color = '#4CAF50';
            }
        }
        
        // Check if bet period is over
        if (throwsSinceBet >= this.activeBet.targetThrows) {
            this.finalizeBet();
        }
    }
    
    calculateAccuracy(piEstimate) {
        const actualPi = Math.PI;
        
        // Calculate accuracy based on decimal places that match
        // More robust method: check error magnitude
        const error = Math.abs(piEstimate - actualPi);
        
        if (error < 0.000005) return 5; // 5 decimal places (error < 5e-6)
        if (error < 0.00005) return 4;  // 4 decimal places (error < 5e-5) 
        if (error < 0.0005) return 3;   // 3 decimal places (error < 5e-4)
        if (error < 0.005) return 2;    // 2 decimal places (error < 5e-3)
        if (error < 0.05) return 1;     // 1 decimal place (error < 5e-2)
        
        return 0; // No significant accuracy
    }

    getErrorThreshold(digits) {
        if (digits <= 0) return 1;
        return 5 * Math.pow(10, -(digits + 1));
    }

    calculateConvergenceProbability(targetThrows) {
        if (!Number.isFinite(targetThrows) || targetThrows <= 0) {
            return {
                yesProbability: 0,
                noProbability: 1,
                yesOdds: this.probabilityToOdds(0),
                noOdds: this.probabilityToOdds(1)
            };
        }

        const digits = this.convergenceTarget;
        const tolerance = this.getErrorThreshold(digits);
        const L = this.needleLength;
        const D = this.lineSpacing;
        const currentThrows = this.totalDrops;
        const currentCrossings = this.crossings;
        const futureThrows = targetThrows;
        const finalThrows = currentThrows + futureThrows;

        const minimumCrossings = 1e-6;

        const rawCrossProbability = (2 * L) / (Math.PI * D);
        const crossingProbability = Math.min(0.999999, Math.max(1e-6, rawCrossProbability));
        const expectedAdditionalCrossings = futureThrows * crossingProbability;
        const varianceAdditionalCrossings = futureThrows * crossingProbability * (1 - crossingProbability);

        const meanCrossings = currentCrossings + expectedAdditionalCrossings;
        const sigmaCrossings = Math.sqrt(Math.max(varianceAdditionalCrossings, minimumCrossings));
        const effectiveMeanCrossings = Math.max(meanCrossings, minimumCrossings);

        const meanPi = (2 * L * finalThrows) / (D * effectiveMeanCrossings);
        const derivative = -(2 * L * finalThrows) / (D * Math.pow(effectiveMeanCrossings, 2));
        const sigmaPi = Math.max(Math.abs(derivative) * sigmaCrossings, 1e-6);

        const piTarget = Math.PI;
        const lowerZ = (piTarget - tolerance - meanPi) / sigmaPi;
        const upperZ = (piTarget + tolerance - meanPi) / sigmaPi;

        const yesProbability = Math.max(0, Math.min(1, this.normalCDF(upperZ) - this.normalCDF(lowerZ)));
        const noProbability = Math.max(0, Math.min(1, 1 - yesProbability));

        return {
            yesProbability,
            noProbability,
            yesOdds: this.probabilityToOdds(yesProbability),
            noOdds: this.probabilityToOdds(noProbability)
        };
    }

    probabilityToOdds(probability) {
        if (!Number.isFinite(probability)) {
            return 1.01;
        }

        const minProbability = 0.001;
        const maxProbability = 0.999;
        const bounded = Math.min(maxProbability, Math.max(minProbability, probability));
        const inverseMinusOne = (1 / bounded) - 1;
        const adjustedOdds = 1 + (1 - this.houseEdge) * inverseMinusOne;
        return Math.min(50, Math.max(1, adjustedOdds));
    }

    normalCDF(x) {
        return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
    }

    erf(x) {
        if (x === 0) {
            return 0;
        }

        const sign = x < 0 ? -1 : 1;
        const absX = Math.abs(x);
        const a1 = 0.254829592;
        const a2 = -0.284496736;
        const a3 = 1.421413741;
        const a4 = -1.453152027;
        const a5 = 1.061405429;
        const p = 0.3275911;

        const t = 1 / (1 + p * absX);
        const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);

        return sign * y;
    }
    
    finalizeBet() {
        if (!this.activeBet || this.activeBet.finished) return;
        
        this.activeBet.finished = true;
        this.pause(); // Stop simulation
        
        const won = this.activeBet.bettingYes === this.activeBet.converged;
        const payout = won ? this.activeBet.amount * this.activeBet.odds : 0;
        
        if (won) {
            this.bettingBalance += payout;
            this.gamesWon++;
        }
        
        // Show results
        this.showBetResults(won, payout);
        this.updateBettingUI();
        
        // Reset for next bet
        setTimeout(() => {
            this.cancelActiveBet();
        }, 5000); // Show results for 5 seconds
    }
    
    showBetResults(won, payout) {
        const resultsDiv = document.getElementById('betResults');
        const titleElement = document.getElementById('betResultTitle');
        const messageElement = document.getElementById('betResultMessage');
        const probabilityText = this.activeBet && Number.isFinite(this.activeBet.probability)
            ? `${(this.activeBet.probability * 100).toFixed(1)}%`
            : null;
        
        resultsDiv.classList.remove('hidden', 'win', 'loss');
        resultsDiv.classList.add(won ? 'win' : 'loss');
        
        if (won) {
            titleElement.textContent = `🎉 YOU WON!`;
            const baseMessage = `Congratulations! You won $${payout.toFixed(2)}`;
            messageElement.textContent = probabilityText ? `${baseMessage}. Win chance was ${probabilityText}.` : baseMessage;
        } else {
            titleElement.textContent = `💸 YOU LOST!`;
            const baseMessage = `Better luck next time! You lost $${this.activeBet.amount.toFixed(2)}`;
            messageElement.textContent = probabilityText ? `${baseMessage}. Win chance was ${probabilityText}.` : baseMessage;
        }
        
        // Update final stats
        const accuracy = this.crossings > 0 ? this.calculateAccuracy((2 * this.needleLength * this.totalDrops) / (this.lineSpacing * this.crossings)) : 0;
        document.getElementById('finalPi').textContent = this.crossings > 0 ? ((2 * this.needleLength * this.totalDrops) / (this.lineSpacing * this.crossings)).toFixed(6) : '0';
        document.getElementById('finalAccuracy').textContent = accuracy;
        document.getElementById('finalThrows').textContent = this.totalDrops;
        
        // Hide results after delay
        setTimeout(() => {
            resultsDiv.classList.add('hidden');
        }, 5000);
    }
    
    cancelActiveBet() {
        if (this.activeBet && !this.activeBet.finished) {
            // Refund bet if cancelled
            this.bettingBalance += this.activeBet.amount;
        }
        
        this.activeBet = null;
        document.getElementById('activeBet').classList.add('hidden');
        document.getElementById('betYesBtn').disabled = false;
        document.getElementById('betNoBtn').disabled = false;
        document.getElementById('convergenceStatus').textContent = 'Waiting...';
        document.getElementById('convergenceStatus').style.color = 'white';
        document.getElementById('progressFill').style.width = '0%';
        document.getElementById('activeBetProbability').textContent = '--';
        document.getElementById('activeBetPayout').textContent = '--';
        this.updateBettingUI();
    }
    
    updateBettingUI() {
        document.getElementById('bettingBalance').textContent = `$${this.bettingBalance.toFixed(2)}`;
        document.getElementById('gamesWon').textContent = this.gamesWon;

        if (this.bettingMode) {
            this.updateOdds();
        }
    }
}

// Initialize simulation when page loads
document.addEventListener('DOMContentLoaded', () => {
    const simulation = new BuffonNeedleSimulation();
});

// Add some visual enhancements
document.addEventListener('DOMContentLoaded', () => {
    // Add hover effects to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            if (!button.disabled) {
                button.style.transform = 'translateY(-2px)';
                button.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
            }
        });
        
        button.addEventListener('mouseleave', () => {
            if (!button.disabled) {
                button.style.transform = 'translateY(0)';
                button.style.boxShadow = 'none';
            }
        });
    });
    
    // Add smooth scrolling for mobile
    if (window.innerWidth <= 768) {
        document.body.style.overscrollBehavior = 'contain';
    }
});