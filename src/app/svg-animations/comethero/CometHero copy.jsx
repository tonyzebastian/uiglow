'use client'

import "./CometHero.css";

export default function CometHero() {

    return (
        <div>
            <div class="circle-container">

            <div class="circle-wrapper circle1">
                <svg viewBox="0 0 400 400" width="200" height="200" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#ff9a9e" />
                    <stop offset="100%" stop-color="#fad0c4" />
                    </linearGradient>
                </defs>
                <circle cx="100" cy="100" r="80" fill="none" stroke="url(#grad1)" stroke-width="1"
                        stroke-dasharray="226 276" stroke-dashoffset="0">
                    <animate attributeName="stroke-dashoffset" from="0" to="502" dur="3s" repeatCount="indefinite" />
                </circle>
                </svg>
            </div>

            <div class="circle-wrapper circle2">
                <svg viewBox="0 0 250 250" width="250" height="250" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#a18cd1" />
                    <stop offset="100%" stop-color="#fbc2eb" />
                    </linearGradient>
                </defs>
                <circle cx="125" cy="125" r="100" fill="none" stroke="url(#grad2)" stroke-width="1"
                        stroke-dasharray="282.7 345.6" stroke-dashoffset="0">
                    <animate attributeName="stroke-dashoffset" from="0" to="628.3" dur="4s" repeatCount="indefinite" />
                </circle>
                </svg>
            </div>

            <div class="circle-wrapper circle3">
                <svg viewBox="0 0 150 150" width="150" height="150" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="grad3" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#84fab0" />
                    <stop offset="100%" stop-color="#8fd3f4" />
                    </linearGradient>
                </defs>
                <circle cx="75" cy="75" r="60" fill="none" stroke="url(#grad3)" stroke-width="1"
                        stroke-dasharray="169 215" stroke-dashoffset="0">
                    <animate attributeName="stroke-dashoffset" from="0" to="384" dur="2.5s" repeatCount="indefinite" />
                </circle>
                </svg>
            </div>

            <div class="circle-wrapper circle4">
                <svg viewBox="0 0 220 220" width="220" height="220" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="grad4" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#ffecd2" />
                    <stop offset="100%" stop-color="#fcb69f" />
                    </linearGradient>
                </defs>
                <circle cx="110" cy="110" r="90" fill="none" stroke="url(#grad4)" stroke-width="1"
                        stroke-dasharray="282 312" stroke-dashoffset="0">
                    <animate attributeName="stroke-dashoffset" from="0" to="594" dur="3.5s" repeatCount="indefinite" />
                </circle>
                </svg>
            </div>
            </div>
        </div>
    );
}
