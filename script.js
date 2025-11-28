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
        this.convergenceTarget = 2; // 2 decimal places (more achievable)
        
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
        // Random position and angle, ensuring needle stays within bounds
        const halfLength = this.needleLength / 2;
        const margin = halfLength + 10; // Small margin to ensure needles fit
        
        const x = margin + Math.random() * (this.canvas.width - 2 * margin);
        const y = margin + Math.random() * (this.canvas.height - 2 * margin);
        const angle = Math.random() * Math.PI; // 0 to π radians
        
        // Calculate needle endpoints
        const x1 = x - halfLength * Math.cos(angle);
        const y1 = y - halfLength * Math.sin(angle);
        const x2 = x + halfLength * Math.cos(angle);
        const y2 = y + halfLength * Math.sin(angle);
        
        // Check if needle crosses any vertical line
        let crosses = false;
        
        // Get the leftmost and rightmost x-coordinates of the needle
        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2);
        
        // Check each vertical line within the needle's span
        for (let lineX = this.lineSpacing; lineX < this.canvas.width; lineX += this.lineSpacing) {
            if (minX <= lineX && lineX <= maxX) {
                crosses = true;
                break;
            }
        }
        
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
        
        // Fade older needles
        this.fadeOldNeedles();
        
        return needle;
    }
    
    fadeOldNeedles() {
        // Keep only recent needles visible for performance, but don't affect the mathematical counters
        const maxVisibleNeedles = 100;
        
        if (this.needles.length > maxVisibleNeedles) {
            // Only remove from visual array, counters (totalDrops, crossings) remain accurate
            this.needles = this.needles.slice(-maxVisibleNeedles);
        }
        
        // Apply fade effect to visible needles
        this.needles.forEach((needle, index) => {
            const age = this.needles.length - index;
            needle.opacity = Math.max(0.1, 1 - (age / maxVisibleNeedles));
        });
    }
    
    drawNeedle(needle) {
        this.ctx.save();
        
        // Set color based on crossing status
        if (needle.crosses) {
            this.ctx.strokeStyle = `rgba(244, 67, 54, ${needle.opacity})`; // Red for crossing
        } else {
            this.ctx.strokeStyle = `rgba(76, 175, 80, ${needle.opacity})`; // Green for non-crossing
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
        
        // Redraw all needles
        this.needles.forEach(needle => this.drawNeedle(needle));
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
            this.updateOdds();
        } else {
            panel.classList.add('hidden');
            bettingStats.forEach(stat => stat.style.display = 'none');
            document.getElementById('betModeBtn').textContent = 'Bet Mode';
            document.getElementById('betModeBtn').classList.remove('active');
            this.cancelActiveBet();
        }
    }
    
    calculateOdds(targetThrows) {
        // Calculate odds based on mathematical probability of convergence
        // Based on Central Limit Theorem - standard error decreases as 1/sqrt(n)
        
        // Estimate probability of achieving 5 decimal places within targetThrows
        // This is a simplified model - in reality it depends on many factors
        const standardError = 1 / Math.sqrt(targetThrows);
        
        // Probability decreases exponentially with required accuracy and inversely with sample size
        const convergenceProbability = Math.exp(-5 * standardError * 10);
        
        // Convert probability to odds (fair odds would be 1/probability)
        // Add house edge of ~10% to make it slightly unfavorable to bettor
        const fairOdds = 1 / Math.max(0.01, convergenceProbability);
        const houseEdgeOdds = fairOdds * 0.9; // 10% house edge
        
        // Cap odds to reasonable range
        return Math.max(1.1, Math.min(10.0, houseEdgeOdds));
    }
    
    updateOdds() {
        const targetThrows = parseInt(document.getElementById('targetThrows').value);
        const betAmount = parseFloat(document.getElementById('betAmount').value);
        
        const odds = this.calculateOdds(targetThrows);
        const payout = betAmount * odds;
        
        document.getElementById('currentOdds').textContent = `1:${odds.toFixed(2)}`;
        document.getElementById('potentialPayout').textContent = `$${payout.toFixed(2)}`;
    }
    
    placeBet(bettingYes) {
        const betAmount = parseFloat(document.getElementById('betAmount').value);
        const targetThrows = parseInt(document.getElementById('targetThrows').value);
        
        if (betAmount > this.bettingBalance) {
            alert('Insufficient balance!');
            return;
        }
        
        if (this.activeBet) {
            alert('You already have an active bet!');
            return;
        }
        
        const odds = this.calculateOdds(targetThrows);
        
        this.activeBet = {
            amount: betAmount,
            targetThrows: targetThrows,
            bettingYes: bettingYes,
            odds: odds,
            startingThrows: this.totalDrops,
            converged: false,
            finished: false
        };
        
        // Deduct bet amount from balance
        this.bettingBalance -= betAmount;
        this.updateBettingUI();
        
        // Show active bet panel
        document.getElementById('activeBet').classList.remove('hidden');
        document.getElementById('betDirection').textContent = bettingYes ? 'YES (Will Converge)' : 'NO (Won\'t Converge)';
        document.getElementById('activeBetAmount').textContent = betAmount.toFixed(2);
        document.getElementById('activeBetTarget').textContent = targetThrows;
        document.getElementById('activeBetOdds').textContent = `1:${odds.toFixed(2)}`;
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
        
        resultsDiv.classList.remove('hidden', 'win', 'loss');
        resultsDiv.classList.add(won ? 'win' : 'loss');
        
        if (won) {
            titleElement.textContent = `🎉 YOU WON!`;
            messageElement.textContent = `Congratulations! You won $${payout.toFixed(2)}`;
        } else {
            titleElement.textContent = `💸 YOU LOST!`;
            messageElement.textContent = `Better luck next time! You lost $${this.activeBet.amount.toFixed(2)}`;
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
        this.updateBettingUI();
    }
    
    updateBettingUI() {
        document.getElementById('bettingBalance').textContent = `$${this.bettingBalance.toFixed(2)}`;
        document.getElementById('gamesWon').textContent = this.gamesWon;
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