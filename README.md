# Buffon's Needle Approximation

An interactive web application that demonstrates Buffon's needle problem - a classic geometric probability experiment used to estimate the value of π (pi).

## 🎯 About

Buffon's needle problem, first posed by Georges-Louis Leclerc, Comte de Buffon in the 18th century, is a question in geometric probability. When a needle of length L is dropped onto a floor with parallel lines separated by distance D, the probability of the needle crossing a line can be used to estimate π.

**Formula**: π ≈ (2L × N) / (D × C)
- L = needle length
- N = total number of needle drops
- D = distance between parallel lines  
- C = number of needles that cross lines

## 🚀 Features

- **Interactive Animation**: Watch needles drop in real-time with smooth animations
- **Customizable Parameters**: Adjust needle length and animation speed
- **Real-time Statistics**: See live updates of π estimation and error percentage
- **🎲 Betting Mode**: Gamified experience - bet on whether π will converge to 5 decimal places within K throws
- **Dynamic Odds**: Smart odds calculation based on difficulty and target throws
- **Mobile Responsive**: Works perfectly on phones, tablets, and desktops
- **Visual Feedback**: Crossing needles are highlighted in red, non-crossing in green
- **Educational**: Includes explanation of the mathematical principle

## 📱 Mobile-Friendly

This app is designed to work seamlessly on mobile devices:
- Touch-friendly controls
- Responsive design that adapts to screen size
- Optimized performance for mobile browsers
- No installation required - runs directly in the browser

## 🎮 How to Use

### Regular Mode
1. **Start the Simulation**: Click the "Start" button to begin dropping needles
2. **Adjust Settings**: 
   - Use the speed slider to control animation speed (1-10)
   - Adjust needle length (0.5-2.0 times the line spacing)
3. **Monitor Results**: Watch as the π estimate becomes more accurate with more needle drops
4. **Reset**: Clear all needles and start fresh anytime

### 🎲 Betting Mode
1. **Enter Betting Mode**: Click the "Bet Mode" button to reveal betting controls
2. **Set Your Bet**: 
   - Choose bet amount ($1-$1000)
   - Set target number of throws (100-10,000)
   - View dynamic odds and potential payout
3. **Place Your Bet**: 
   - **Bet YES**: You believe π will converge to 5 decimal places within the target throws
   - **Bet NO**: You believe it won't converge in time
4. **Watch & Win**: Monitor the progress bar and convergence status
5. **Collect Winnings**: Successful bets pay out based on the odds when you placed the bet

**Starting Balance**: $100  
**Odds Range**: 1.1:1 to 5.0:1 (dynamically calculated based on difficulty)

## 🌐 GitHub Pages Deployment

This app is designed to be hosted on GitHub Pages:

1. **Fork or Clone** this repository
2. **Enable GitHub Pages** in repository settings
3. **Select Source**: Choose "Deploy from a branch" and select `main` branch
4. **Access**: Your app will be available at `https://yourusername.github.io/buffon`

### Quick Deploy Steps:

```bash
# Clone the repository
git clone https://github.com/yourusername/buffon.git
cd buffon

# Push to your GitHub repository
git add .
git commit -m "Initial commit"
git push origin main
```

Then enable GitHub Pages in your repository settings.

## 🔧 Technical Details

- **Pure HTML/CSS/JavaScript**: No frameworks or dependencies required
- **Canvas API**: Used for smooth 2D graphics and animations
- **Responsive Design**: CSS Grid and Flexbox for mobile compatibility
- **Progressive Web App Ready**: Can be enhanced with service workers for offline use

## 📊 Mathematical Background

The simulation demonstrates that as the number of needle drops increases, the estimated value of π converges to the true value (≈3.14159). This is a practical example of:

- **Monte Carlo Methods**: Using random sampling to solve mathematical problems
- **Law of Large Numbers**: How sample means approach expected values
- **Geometric Probability**: Probability based on geometric measurements

## 🎨 Customization

The app can be easily customized:

- **Colors**: Modify CSS variables in `styles.css`
- **Canvas Size**: Adjust dimensions in the JavaScript
- **Line Spacing**: Change the `lineSpacing` parameter
- **Animation Effects**: Modify the fade and drawing functions

## 🌟 Browser Support

Works in all modern browsers:
- Chrome/Chromium (recommended)
- Firefox
- Safari (iOS/macOS)
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📄 License

MIT License - feel free to use, modify, and distribute.

## 🤝 Contributing

Contributions welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

---

**Live Demo**: [View on GitHub Pages](https://yourusername.github.io/buffon)

Enjoy exploring the fascinating world of geometric probability! 🎲