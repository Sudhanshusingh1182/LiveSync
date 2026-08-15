function stringToColor(text: string) {
   
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            hash = text.charCodeAt(i) + ((hash << 5) - hash);
        }
    
        // Generate greenish color based on hash
        const r = (hash & 0xFF) % 128; // Limit red to a lower value
        const g = ((hash >> 8) & 0xFF) % 128 + 128; // Make green dominant
        const b = ((hash >> 16) & 0xFF) % 128 + 128; // Make blue bright but secondary
    
        // Convert to hex and return as color string
        const color = `#${[r, g, b]
            .map((x) => x.toString(16).padStart(2, '0'))
            .join('')}`;
        return color;
    }
    
   
export default stringToColor;