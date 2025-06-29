// Blynk API Integration for SenSecure Dashboard
class BlynkIntegration {
    constructor() {
        this.AUTH_TOKEN = " ";
        this.TEMPLATE_ID = " ";
        this.API_BASE_URL = "";
        
        // Virtual pin mapping from ESP32 code
        this.VPIN = {
            GAS_METER: "V5",    // Gas value meter widget
            RAIN_CONTROL: "V1", // Button/Toggle to control rain servo (clothes in/out)
            LOCK_CONTROL: "V2", // Button/Toggle to control door lock relay
            GAS_CONTROL: "V3",  // Button/Toggle for gas regulator manual override
            PIR_CONTROL: "V4"   // Button/Toggle to enable/disable motion sensor
        };
        
        this.init();
    }
    
    init() {
        // Initialize dashboard connections after DOM is loaded
        document.addEventListener('DOMContentLoaded', () => {
            console.log("Initializing Blynk integration...");
            this.setupDashboardConnections();
            this.startPolling();
            
            // Connection status check
            const statusElement = document.getElementById('blynk-connection-status');
            if (statusElement) {
                this.getPin('V0').then(() => {
                    statusElement.textContent = 'Blynk: Connected';
                    statusElement.classList.add('blynk-connected');
                    addNotification('Blynk', 'Successfully connected to Blynk server', 'system');
                }).catch(() => {
                    statusElement.textContent = 'Blynk: Disconnected';
                    statusElement.classList.add('blynk-disconnected');
                    addNotification('Blynk', 'Failed to connect to Blynk server', 'system');
                });
            }
        });
    }
    
    setupDashboardConnections() {
        // Connect Rain Control buttons
        const bringInsideBtn = document.getElementById('bring-inside-btn');
        const putOutsideBtn = document.getElementById('put-outside-btn');
        
        if(bringInsideBtn) {
            bringInsideBtn.addEventListener('click', () => {
                // Direct URL for bringing clothes inside (v1=1)
                fetch(`${this.API_BASE_URL}update?token=${this.AUTH_TOKEN}&v1=1`)
                    .then(response => {
                        if (response.ok) {
                            document.getElementById('clothes-status').textContent = 'Inside';
                            document.getElementById('rain-status-indicator').className = 'status-indicator status-inactive';
                            addNotification('Rain Alert System', 'Clothes brought inside via Blynk', 'rain');
                        } else {
                            console.error("Error bringing clothes inside");
                        }
                    })
                    .catch(error => console.error("Failed to bring clothes inside:", error));
            });
        }
        
        if(putOutsideBtn) {
            putOutsideBtn.addEventListener('click', () => {
                // Direct URL for putting clothes outside (v1=0)
                fetch(`${this.API_BASE_URL}update?token=${this.AUTH_TOKEN}&v1=0`)
                    .then(response => {
                        if (response.ok) {
                            document.getElementById('clothes-status').textContent = 'Outside';
                            addNotification('Rain Alert System', 'Clothes put outside via Blynk', 'rain');
                        } else {
                            console.error("Error putting clothes outside");
                        }
                    })
                    .catch(error => console.error("Failed to put clothes outside:", error));
            });
        }
        
        // Connect Door Lock buttons
        const lockBtn = document.getElementById('lock-btn');
        const unlockBtn = document.getElementById('unlock-btn');
        
        if(lockBtn) {
            lockBtn.addEventListener('click', () => {
                // In the ESP32 code, the lock is controlled by a relay that's HIGH for locked
                
                fetch(`${this.API_BASE_URL}update?token=${this.AUTH_TOKEN}&v2=0`)
                    .then(response => {
                        if (response.ok) {
                            document.getElementById('lock-status').textContent = 'Door Locked';
                            document.getElementById('lock-status-indicator').className = 'status-indicator status-active';
                            document.getElementById('door-last-activity').textContent = 'Just now';
                            addNotification('Door Lock System', 'Door locked via Blynk', 'door');
                        } else {
                            console.error("Error locking door");
                        }
                    })
                    .catch(error => console.error("Failed to lock door:", error));
            });
        }
        
        if(unlockBtn) {
            unlockBtn.addEventListener('click', () => {
                // Direct URL for unlocking door (v2=1)
                fetch(`${this.API_BASE_URL}update?token=${this.AUTH_TOKEN}&v2=1`)
                    .then(response => {
                        if (response.ok) {
                            document.getElementById('lock-status').textContent = 'Door Unlocked';
                            document.getElementById('lock-status-indicator').className = 'status-indicator status-warning';
                            document.getElementById('door-last-activity').textContent = 'Just now';
                            addNotification('Door Lock System', 'Door unlocked via Blynk', 'door');
                            
                            // Auto-relock happens on the ESP32 side after 5 seconds
                            setTimeout(() => {
                                document.getElementById('lock-status').textContent = 'Door Locked';
                                document.getElementById('lock-status-indicator').className = 'status-indicator status-active';
                                addNotification('Door Lock System', 'Door auto-locked', 'door');
                            }, 5000);
                        } else {
                            console.error("Error unlocking door");
                        }
                    })
                    .catch(error => console.error("Failed to unlock door:", error));
            });
        }
        
        // Connect Gas Regulator buttons - FIXED: v3=0 turns ON, v3=1 turns OFF
        const turnOnBtn = document.getElementById('turn-on-btn');
        const turnOffBtn = document.getElementById('turn-off-btn');
        
        if(turnOnBtn) {
            turnOnBtn.addEventListener('click', () => {
                // FIXED: Direct URL for turning gas regulator ON (v3=0)
                fetch(`${this.API_BASE_URL}update?token=${this.AUTH_TOKEN}&v3=0`)
                    .then(response => {
                        if (response.ok) {
                            document.getElementById('regulator-status').textContent = 'ON';
                            addNotification('Gas Leak Detection', 'Gas regulator turned ON via Blynk', 'gas');
                        } else {
                            console.error("Error turning gas regulator on");
                        }
                    })
                    .catch(error => console.error("Failed to turn gas regulator on:", error));
            });
        }
        
        if(turnOffBtn) {
            turnOffBtn.addEventListener('click', () => {
                // FIXED: Direct URL for turning gas regulator OFF (v3=1)
                fetch(`${this.API_BASE_URL}update?token=${this.AUTH_TOKEN}&v3=1`)
                    .then(response => {
                        if (response.ok) {
                            document.getElementById('regulator-status').textContent = 'OFF';
                            addNotification('Gas Leak Detection', 'Gas regulator turned OFF via Blynk', 'gas');
                        } else {
                            console.error("Error turning gas regulator off");
                        }
                    })
                    .catch(error => console.error("Failed to turn gas regulator off:", error));
            });
        }
        
        // Connect Motion Sensor buttons
        const sensorOnBtn = document.getElementById('sensor-on-btn');
        const sensorOffBtn = document.getElementById('sensor-off-btn');
        
        if(sensorOnBtn) {
            sensorOnBtn.addEventListener('click', () => {
                // Direct URL for turning motion sensor ON (v4=1)
                fetch(`${this.API_BASE_URL}update?token=${this.AUTH_TOKEN}&v4=1`)
                    .then(response => {
                        if (response.ok) {
                            document.getElementById('motion-status').textContent = 'Sensor Active';
                            document.getElementById('motion-status-indicator').className = 'status-indicator status-active';
                            addNotification('Motion Sensor', 'Motion sensor activated via Blynk', 'motion');
                        } else {
                            console.error("Error activating motion sensor");
                        }
                    })
                    .catch(error => console.error("Failed to activate motion sensor:", error));
            });
        }
        
        if(sensorOffBtn) {
            sensorOffBtn.addEventListener('click', () => {
                // Direct URL for turning motion sensor OFF (v4=0)
                fetch(`${this.API_BASE_URL}update?token=${this.AUTH_TOKEN}&v4=0`)
                    .then(response => {
                        if (response.ok) {
                            document.getElementById('motion-status').textContent = 'Sensor Inactive';
                            document.getElementById('motion-status-indicator').className = 'status-indicator status-inactive';
                            addNotification('Motion Sensor', 'Motion sensor deactivated via Blynk', 'motion');
                        } else {
                            console.error("Error deactivating motion sensor");
                        }
                    })
                    .catch(error => console.error("Failed to deactivate motion sensor:", error));
            });
        }
    }
    
    startPolling() {
        // Poll for device status updates every 5 seconds
        console.log("Starting Blynk status polling...");
        this.updateAllStates();
        
        setInterval(() => {
            this.updateAllStates();
        }, 5000);
    }
    
    updateAllStates() {
        // Get all relevant pin states
        this.getPin(this.VPIN.GAS_METER).then(value => {
            this.updateGasMeter(value);
        }).catch(error => {
            console.error("Error getting gas meter value:", error);
        });
        
        this.getPin(this.VPIN.RAIN_CONTROL).then(value => {
            this.updateRainStatus(value);
        }).catch(error => {
            console.error("Error getting rain control value:", error);
        });
        
        this.getPin(this.VPIN.GAS_CONTROL).then(value => {
            this.updateGasRegulator(value);
        }).catch(error => {
            console.error("Error getting gas control value:", error);
        });
        
        this.getPin(this.VPIN.PIR_CONTROL).then(value => {
            this.updateMotionSensor(value);
        }).catch(error => {
            console.error("Error getting PIR control value:", error);
        });
    }
    
    // Update UI based on pin values
    updateGasMeter(value) {
        const gasLevel = document.getElementById('gas-level');
        const gasStatus = document.getElementById('gas-status');
        const gasIndicator = document.getElementById('gas-status-indicator');
        
        if(gasLevel && gasStatus && gasIndicator) {
            // Convert the value to a percentage for display (assuming max value is 4095)
            const percentage = Math.min(100, Math.max(0, (value / 4095) * 100));
            gasLevel.style.width = `${percentage}%`;
            
            // Change color and status based on threshold
            if(value > 2000) {
                gasStatus.textContent = 'Gas leak detected';
                gasIndicator.className = 'status-indicator status-warning';
                
                // Only add notification if status has changed
                if(gasStatus.textContent !== 'Gas leak detected') {
                    addNotification('Gas Alert', 'Gas leak detected by sensor', 'gas');
                }
            } else {
                gasStatus.textContent = 'No gas leak detected';
                gasIndicator.className = 'status-indicator status-inactive';
            }
        }
    }
    
    updateRainStatus(value) {
        const clothesStatus = document.getElementById('clothes-status');
        
        if(clothesStatus) {
            if(value == 1) {
                clothesStatus.textContent = 'Inside';
            } else {
                clothesStatus.textContent = 'Outside';
            }
        }
    }
    
    updateGasRegulator(value) {
        const regulatorStatus = document.getElementById('regulator-status');
        
        if(regulatorStatus) {
            // FIXED: Logic inverted - v3=0 means ON, v3=1 means OFF
            if(value == 0) {
                regulatorStatus.textContent = 'ON';
            } else {
                regulatorStatus.textContent = 'OFF';
            }
        }
    }
    
    updateMotionSensor(value) {
        const motionStatus = document.getElementById('motion-status');
        const motionIndicator = document.getElementById('motion-status-indicator');
        
        if(motionStatus && motionIndicator) {
            if(value == 1) {
                motionStatus.textContent = 'Sensor Active';
                motionIndicator.className = 'status-indicator status-active';
            } else {
                motionStatus.textContent = 'Sensor Inactive';
                motionIndicator.className = 'status-indicator status-inactive';
            }
        }
    }
    
    // API interaction methods
    async getPin(pin) {
        try {
            const url = `${this.API_BASE_URL}get?token=${this.AUTH_TOKEN}&${pin}`;
            const response = await fetch(url);
            
            if(!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log(`Got value for pin ${pin}:`, data);
            return data;
        } catch(error) {
            console.error(`Error getting pin ${pin}:`, error);
            return null;
        }
    }
    
    // The setPin method is kept for polling and other functionalities
    // but the direct URLs are used for button actions
    async setPin(pin, value) {
        try {
            const url = `${this.API_BASE_URL}update?token=${this.AUTH_TOKEN}&${pin}=${value}`;
            const response = await fetch(url);
            
            if(!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            console.log(`Set pin ${pin} to ${value}`);
            return true;
        } catch(error) {
            console.error(`Error setting pin ${pin} to ${value}:`, error);
            return false;
        }
    }
}

// Initialize the Blynk integration
const blynkIntegration = new BlynkIntegration();