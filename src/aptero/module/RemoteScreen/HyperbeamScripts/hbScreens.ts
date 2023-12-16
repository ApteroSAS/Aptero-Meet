/**
 * Generates a loading screen to be displayed while we load the Hyperbeam session
 * 
 * @param width - The width of the screen.
 * @param height - The height of the screen.
 * 
 * @returns - The canvas, context, and animationInterval of the loading screen.
 * 
 * @example - loadingScreen(1280, 720);
 *  */

export function loadingScreen(width: number,height: number) {
  
  const sProp = height / 720;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  
  // Gradient background with less bright colors
  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#483D8B'); // Darker purple
  gradient.addColorStop(1, '#9370DB'); // Muted purple
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
  
  // Rounded rectangle
  context.fillStyle = 'rgba(255, 255, 255, 0.2)';
  context.beginPath();
  context.roundRect(20 * sProp, 20 * sProp, width - 40 * sProp, height - 40 * sProp, 40 * sProp);
  context.fill();
  
  // Loading text
  context.font = `${sProp * 94}px Arial`; // Scaled font size
  context.fillStyle = '#FFFFFF';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('Loading Browser', width / 2, height / 2 - 120 * sProp);
  
  // Animated Loading Circle
  let angle = 0;
  const drawLoadingCircle = () => {
    // Apply sProp for scaling the loading circle
    const radius = 80 * sProp;
    const lineWidth = 16 * sProp;
    const circleCenterY = height / 2 + 90 * sProp;

    context.beginPath();
    context.arc(width / 2, circleCenterY, radius, 0, Math.PI * 2);
    context.strokeStyle = '#FFFFFF';
    context.lineWidth = lineWidth;
    context.stroke();

    // Draw a smaller arc to create the rotating effect
    context.beginPath();
    context.arc(width / 2, circleCenterY, radius, angle, angle + Math.PI / 2);
    context.strokeStyle = '#FFA700'; // Gold color for visibility
    context.stroke();

    angle += 0.1; // Change this value to adjust the speed of rotation
  };
  
  let animationInterval = setInterval(drawLoadingCircle, 20);  
  return {
    canvas,
    context,
    animationInterval
  };
}


export function pinElScreen(finalContext, width, height) {
  // -Shadow
  finalContext.shadowColor = 'rgba(0, 0, 0, 0.5)';
  finalContext.shadowBlur = 20;
  finalContext.shadowOffsetX = 0;
  finalContext.shadowOffsetY = 10; 
  // -Background
  const hcenter = height / 2;
  finalContext.fillStyle = 'black';
  finalContext.beginPath();
  finalContext.roundRect(30, hcenter-160, width-60, 280, 40);
  finalContext.fill();
  finalContext.shadowColor = 'rgba(0, 0, 0, 0)';
  // -Inner Background
  finalContext.fillStyle = '#ffcc00';
  finalContext.beginPath();
  finalContext.roundRect(50, hcenter-140, width-100, 240, 30);
  finalContext.fill();

  // -Text
  finalContext.font = 'bold 130px Helvetica'
  finalContext.fillStyle = 'black'
  finalContext.textAlign = 'center'
  finalContext.textBaseline = 'middle'
  finalContext.fillText('PIN this element', width / 2, hcenter -50);
  finalContext.font = '70px Helvetica'
  finalContext.fillText('to enable input control', width / 2, hcenter +50);
}