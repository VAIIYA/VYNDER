# PWA Icons Required

This app requires two icon files for PWA functionality:

1. `icon-192x192.png` - 192x192 pixels
2. `icon-512x512.png` - 512x512 pixels

## How to Create Icons

### Option 1: Online Tools
- Use https://www.favicon-generator.org/
- Use https://realfavicongenerator.net/
- Use https://www.pwabuilder.com/imageGenerator

### Option 2: Image Editor
1. Create a square image (at least 512x512)
2. Design your app logo/icon
3. Export as PNG
4. Resize to both 192x192 and 512x512
5. Save in the `public/` directory

### Option 3: Quick Placeholder
For testing, you can use a simple colored square:
- Use any image editor to create a red square
- Add text "VYNDER" in the center
- Export at both sizes

## Icon Requirements
- Format: PNG
- Square aspect ratio (1:1)
- Transparent or solid background
- Should work on both light and dark backgrounds
- Recommended: Use maskable icons for better Android support

## After Adding Icons
1. Icons should be in `/public/` directory
2. Restart the dev server
3. Test PWA installation on mobile device
4. Icons will appear in app launcher






