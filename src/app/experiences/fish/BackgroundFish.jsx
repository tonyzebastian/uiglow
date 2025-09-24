export default class BackgroundFishController {
    constructor() {
        if (typeof window === 'undefined') return;

        this.fishes = Array.from(document.querySelectorAll('.background-fish'));
        
        // Initialize with random positions spread across the viewport
        this.fishData = this.fishes.map(() => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            velocityX: 0,
            velocityY: 0,
            // Further reduced speeds and acceleration for slower movement
            speed: 0.2 + Math.random() * 0.2,        // Reduced from original fish speeds
            maxSpeed: 1 + Math.random() * 0.5,       // Reduced for slower movement
            acceleration: 0.02 + Math.random() * 0.02, // Reduced for gentler acceleration
            currentAngle: 0,
            
            // Increased personal space for more spread out movement
            personalSpace: 100 + Math.random() * 100, // Increased from original
            avoidFactor: 0.2 + Math.random() * 0.3,
            // Random wandering points instead of mouse target
            targetX: Math.random() * window.innerWidth,
            targetY: Math.random() * window.innerHeight
        }));

        // Immediately position fish
        this.fishData.forEach((data, index) => {
            const fish = this.fishes[index];
            const xPercent = (data.x / window.innerWidth) * 100;
            const yPercent = (data.y / window.innerHeight) * 100;
            fish.style.transform = `translate(${xPercent}vw, ${yPercent}vh) rotate(${data.currentAngle}rad)`;
        });

        this.updateTargets();
        this.animate();
    }

    updateTargets() {
        // Periodically update random target positions
        setInterval(() => {
            this.fishData.forEach(data => {
                data.targetX = Math.random() * window.innerWidth;
                data.targetY = Math.random() * window.innerHeight;
            });
        }, 5000); // Change targets every 5 seconds
    }
    
    updateFish(fish, data, index) {
        // Vector to target
        const dx = data.targetX - data.x;
        const dy = data.targetY - data.y;
        const distToTarget = Math.sqrt(dx * dx + dy * dy);
        
        // Initialize acceleration vectors
        let accX = 0;
        let accY = 0;
        
        // Only move if we're not very close to the target
        if (distToTarget > 5) {
            // Calculate direction to target
            const dirX = dx / distToTarget;
            const dirY = dy / distToTarget;
            
            // Smooth acceleration towards target
            const accelerationFactor = Math.min(1, distToTarget / 200);
            accX = dirX * data.acceleration * accelerationFactor;
            accY = dirY * data.acceleration * accelerationFactor;
            
            // Avoid other fish
            this.fishData.forEach((otherData, otherIndex) => {
                if (index === otherIndex) return;
                
                const offsetX = data.x - otherData.x;
                const offsetY = data.y - otherData.y;
                const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
                
                // Adjust personal space based on distance to target
                const dynamicPersonalSpace = data.personalSpace * (1 + distToTarget / 1000);
                
                if (distance < dynamicPersonalSpace) {
                    const repulsionStrength = (dynamicPersonalSpace - distance) / dynamicPersonalSpace;
                    const avoidScale = 0.3;
                    accX += (offsetX / distance) * repulsionStrength * avoidScale;
                    accY += (offsetY / distance) * repulsionStrength * avoidScale;
                }
            });
            
            // Apply acceleration to velocity
            data.velocityX += accX;
            data.velocityY += accY;
            
            // Calculate current speed
            const currentSpeed = Math.sqrt(data.velocityX * data.velocityX + data.velocityY * data.velocityY);
            
            // Apply speed limit
            if (currentSpeed > data.maxSpeed) {
                data.velocityX = (data.velocityX / currentSpeed) * data.maxSpeed;
                data.velocityY = (data.velocityY / currentSpeed) * data.maxSpeed;
            }
        } else {
            // Gentler slowdown when near target
            data.velocityX *= 0.98;
            data.velocityY *= 0.98;
        }
        
        // Update position
        data.x += data.velocityX * data.speed;
        data.y += data.velocityY * data.speed;
        
        // Keep fish within bounds
        const margin = 50;
        if (data.x < -margin) data.x = window.innerWidth + margin;
        if (data.x > window.innerWidth + margin) data.x = -margin;
        if (data.y < -margin) data.y = window.innerHeight + margin;
        if (data.y > window.innerHeight + margin) data.y = -margin;
        
        // Convert to percentage for CSS
        const xPercent = (data.x / window.innerWidth) * 100;
        const yPercent = (data.y / window.innerHeight) * 100;
        
        // Calculate the base angle from velocity
        const speed = Math.sqrt(data.velocityX * data.velocityX + data.velocityY * data.velocityY);
        
        if (speed > 0.1) { // Only update rotation if moving significantly
            // Calculate the target angle based on velocity
            const targetAngle = Math.atan2(data.velocityY, data.velocityX);
            
            // Initialize currentAngle if not set
            if (typeof data.currentAngle === 'undefined') {
                data.currentAngle = targetAngle;
            }
            
            // Smooth angle interpolation
            let angleDiff = targetAngle - data.currentAngle;
            // Normalize angle difference to ensure shortest rotation path
            angleDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));
            data.currentAngle += angleDiff * 0.1;
        }
        
        // First apply rotation
        fish.style.transform = `translate(${xPercent}vw, ${yPercent}vh) rotate(${data.currentAngle}rad)`;
        
        // Then handle the fish sprite direction
        const wrapper = fish.querySelector('.fish-wrapper');
        // No flipping needed - the fish sprite should point right by default
        wrapper.style.transform = 'scale(1, 1)';
    }
    
    animate() {
        this.fishes.forEach((fish, index) => {
            this.updateFish(fish, this.fishData[index], index);
        });
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BackgroundFishController();
});