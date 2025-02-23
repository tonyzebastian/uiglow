export default class FishController {

    constructor() {
        if (typeof window === 'undefined') return;

        this.fishes = Array.from(document.querySelectorAll('.fish'));
        
        // Initialize with random positions spread across the viewport
        this.fishData = this.fishes.map(() => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            velocityX: 0,
            velocityY: 0,
            // Reduced speeds and acceleration
            speed: 0.5 + Math.random() * 0.3,        // Reduced from 2
            maxSpeed: 2 + Math.random() * 1,         // Reduced from 5
            acceleration: 0.05 + Math.random() * 0.05, // Reduced from 0.2
            currentAngle: 0,
            
            personalSpace: 30 + Math.random() * 50,
            avoidFactor: 0.2 + Math.random() * 0.3,
            targetX: window.innerWidth / 2,
            targetY: window.innerHeight / 2
        }));

        this.lastMouseX = window.innerWidth / 2;
        this.lastMouseY = window.innerHeight / 2;
        this.mouseMoving = false;

        // Immediately position fish
        this.fishData.forEach((data, index) => {
            const fish = this.fishes[index];
            const xPercent = (data.x / window.innerWidth) * 100;
            const yPercent = (data.y / window.innerHeight) * 100;
            fish.style.transform = `translate(${xPercent}vw, ${yPercent}vh) rotate(${data.currentAngle}rad)`;
        });

        this.setupEventListeners();
        this.animate();
    }

    setupEventListeners() {
        document.addEventListener('mousemove', (e) => {
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
            this.mouseMoving = true;
            
            // Update target position for all fish
            this.fishData.forEach(data => {
                data.targetX = this.lastMouseX;
                data.targetY = this.lastMouseY;
            });

            // Reset mouse moving flag after a short delay
            clearTimeout(this.mouseTimeout);
            this.mouseTimeout = setTimeout(() => {
                this.mouseMoving = false;
            }, 100);
        });
    }
    
    updateFish(fish, data, index) {
        // Vector to target (last mouse position)
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
    new FishController();
});