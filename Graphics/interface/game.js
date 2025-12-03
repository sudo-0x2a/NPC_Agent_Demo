/**
 * AI NPC Demo
 */

const API_BASE = '/api';
let hotbarSlots = [];  // Store references to hotbar slot graphics
let phaserScene = null;  // Store Phaser scene reference

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game',
    scene: {
        preload: preload,
        create: create
    }
};

const game = new Phaser.Game(config);

function preload() {
    this.load.image('bg', '/assets/background.png');
    
    // Preload item icons (filename without extension as key)
    this.load.image('card.jpg', '/assets/card.jpg');
}

function create() {
    phaserScene = this;
    
    // Background
    this.add.image(640, 360, 'bg').setDisplaySize(1280, 720);
    
    // Reset button (top left)
    createResetButton();
    
    // Dialogue box for NPC responses
    createDialogueBox();
    
    // Input bar for player messages
    createInputBar();
    
    // Item hotbar (Minecraft style)
    createHotbar(this);
}

function createResetButton() {
    const gameContainer = document.getElementById('game');
    
    const resetButton = document.createElement('button');
    resetButton.id = 'reset-button';
    resetButton.textContent = '重置';
    resetButton.style.cssText = `
        position: absolute;
        left: 20px;
        top: 20px;
        padding: 8px 16px;
        font-size: 13px;
        font-family: 'Microsoft YaHei', sans-serif;
        background: linear-gradient(180deg, rgba(140, 60, 60, 0.9) 0%, rgba(80, 30, 30, 0.9) 100%);
        border: 2px solid rgba(180, 80, 80, 0.8);
        border-radius: 6px;
        color: #ffe0e0;
        cursor: pointer;
        transition: all 0.15s ease;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        z-index: 100;
    `;
    
    // Hover effects
    resetButton.addEventListener('mouseenter', () => {
        resetButton.style.background = 'linear-gradient(180deg, rgba(180, 80, 80, 0.95) 0%, rgba(140, 60, 60, 0.95) 100%)';
        resetButton.style.boxShadow = '0 2px 10px rgba(180, 80, 80, 0.5)';
    });
    resetButton.addEventListener('mouseleave', () => {
        resetButton.style.background = 'linear-gradient(180deg, rgba(140, 60, 60, 0.9) 0%, rgba(80, 30, 30, 0.9) 100%)';
        resetButton.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.3)';
    });
    resetButton.addEventListener('mousedown', () => {
        resetButton.style.transform = 'scale(0.97)';
    });
    resetButton.addEventListener('mouseup', () => {
        resetButton.style.transform = 'scale(1)';
    });
    
    // Reset action
    resetButton.addEventListener('click', resetGame);
    
    gameContainer.appendChild(resetButton);
}

async function resetGame() {
    try {
        const response = await fetch(`${API_BASE}/reset`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ thread_id: 'player1' })
        });
        
        if (response.ok) {
            // Clear dialogue boxes
            const playerBox = document.getElementById('player-box');
            const dialogueBox = document.getElementById('dialogue-box');
            const playerText = document.getElementById('player-text');
            const npcText = document.getElementById('npc-text');
            
            if (playerBox) playerBox.style.display = 'none';
            if (dialogueBox) dialogueBox.style.display = 'none';
            if (playerText) playerText.textContent = '';
            if (npcText) npcText.textContent = '';
            
            // Clear all items from hotbar
            hotbarSlots.forEach(slot => {
                if (slot.itemImage) {
                    slot.itemImage.destroy();
                    slot.itemImage = null;
                    slot.item = null;
                }
            });
            
            console.log('Game reset successfully');
        }
    } catch (error) {
        console.error('Error resetting game:', error);
    }
}

function createDialogueBox() {
    const gameContainer = document.getElementById('game');
    
    // Create player message box (right side, green tint)
    const playerBox = document.createElement('div');
    playerBox.id = 'player-box';
    playerBox.style.cssText = `
        position: absolute;
        right: 40px;
        top: 80px;
        width: 280px;
        min-height: 60px;
        max-height: 150px;
        padding: 14px 18px;
        background: rgba(34, 72, 58, 0.9);
        border: 2px solid rgba(86, 160, 120, 0.8);
        border-radius: 8px;
        color: #d0f0e0;
        font-size: 14px;
        font-family: 'Microsoft YaHei', sans-serif;
        line-height: 1.5;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        z-index: 100;
        overflow-y: auto;
        display: none;
    `;
    
    // Add label
    const playerLabel = document.createElement('div');
    playerLabel.style.cssText = `
        font-size: 12px;
        color: rgba(86, 160, 120, 0.9);
        margin-bottom: 8px;
        font-weight: bold;
    `;
    playerLabel.textContent = '你';
    
    const playerText = document.createElement('div');
    playerText.id = 'player-text';
    
    playerBox.appendChild(playerLabel);
    playerBox.appendChild(playerText);
    gameContainer.appendChild(playerBox);
    
    // Create NPC dialogue box (left side, blue tint)
    const dialogueBox = document.createElement('div');
    dialogueBox.id = 'dialogue-box';
    dialogueBox.style.cssText = `
        position: absolute;
        left: 40px;
        top: 80px;
        width: 280px;
        min-height: 60px;
        max-height: 150px;
        padding: 14px 18px;
        background: rgba(26, 58, 92, 0.9);
        border: 2px solid rgba(74, 127, 181, 0.8);
        border-radius: 8px;
        color: #e0f0ff;
        font-size: 14px;
        font-family: 'Microsoft YaHei', sans-serif;
        line-height: 1.5;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        z-index: 100;
        overflow-y: auto;
        display: none;
    `;
    
    // Add label
    const npcLabel = document.createElement('div');
    npcLabel.style.cssText = `
        font-size: 12px;
        color: rgba(106, 159, 213, 0.9);
        margin-bottom: 8px;
        font-weight: bold;
    `;
    npcLabel.textContent = '小红';
    
    const npcText = document.createElement('div');
    npcText.id = 'npc-text';
    
    dialogueBox.appendChild(npcLabel);
    dialogueBox.appendChild(npcText);
    gameContainer.appendChild(dialogueBox);
}

function showPlayerMessage(text) {
    const playerBox = document.getElementById('player-box');
    const playerText = document.getElementById('player-text');
    playerText.textContent = text;
    playerBox.style.display = 'block';
}

function showDialogue(text) {
    const dialogueBox = document.getElementById('dialogue-box');
    const npcText = document.getElementById('npc-text');
    npcText.textContent = text;
    dialogueBox.style.display = 'block';
}

function createInputBar() {
    const gameContainer = document.getElementById('game');
    
    // Calculate position (above the hotbar)
    const slotSize = 50;
    const hotbarY = 720 - slotSize - 20; // 650
    const inputBarY = hotbarY - 100; // 50px above hotbar
    
    // Create input container
    const inputContainer = document.createElement('div');
    inputContainer.id = 'input-container';
    inputContainer.style.cssText = `
        position: absolute;
        left: 50%;
        top: ${inputBarY}px;
        transform: translateX(-50%);
        display: flex;
        gap: 8px;
        z-index: 100;
    `;
    
    // Create text input
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'message-input';
    input.placeholder = '输入消息...';
    input.style.cssText = `
        width: 400px;
        padding: 10px 16px;
        font-size: 14px;
        font-family: 'Microsoft YaHei', sans-serif;
        background: rgba(26, 58, 92, 0.85);
        border: 2px solid rgba(74, 127, 181, 0.8);
        border-radius: 6px;
        color: #e0f0ff;
        outline: none;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(106, 159, 213, 0.3);
    `;
    
    // Input focus/blur effects
    input.addEventListener('focus', () => {
        input.style.borderColor = 'rgba(106, 159, 213, 1)';
        input.style.boxShadow = '0 2px 12px rgba(74, 127, 181, 0.5), inset 0 1px 0 rgba(106, 159, 213, 0.3)';
    });
    input.addEventListener('blur', () => {
        input.style.borderColor = 'rgba(74, 127, 181, 0.8)';
        input.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(106, 159, 213, 0.3)';
    });
    
    // Create send button
    const sendButton = document.createElement('button');
    sendButton.id = 'send-button';
    sendButton.textContent = '发送';
    sendButton.style.cssText = `
        padding: 10px 20px;
        font-size: 14px;
        font-family: 'Microsoft YaHei', sans-serif;
        background: linear-gradient(180deg, rgba(74, 127, 181, 0.9) 0%, rgba(30, 58, 95, 0.9) 100%);
        border: 2px solid rgba(106, 159, 213, 0.8);
        border-radius: 6px;
        color: #e0f0ff;
        cursor: pointer;
        transition: all 0.15s ease;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    `;
    
    // Button hover/active effects
    sendButton.addEventListener('mouseenter', () => {
        sendButton.style.background = 'linear-gradient(180deg, rgba(106, 159, 213, 0.95) 0%, rgba(74, 127, 181, 0.95) 100%)';
        sendButton.style.boxShadow = '0 2px 10px rgba(74, 127, 181, 0.5)';
    });
    sendButton.addEventListener('mouseleave', () => {
        sendButton.style.background = 'linear-gradient(180deg, rgba(74, 127, 181, 0.9) 0%, rgba(30, 58, 95, 0.9) 100%)';
        sendButton.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.3)';
    });
    sendButton.addEventListener('mousedown', () => {
        sendButton.style.transform = 'scale(0.97)';
    });
    sendButton.addEventListener('mouseup', () => {
        sendButton.style.transform = 'scale(1)';
    });
    
    // Send message on button click
    sendButton.addEventListener('click', () => {
        sendMessage(input.value);
        input.value = '';
    });
    
    // Send message on Enter key
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && input.value.trim()) {
            sendMessage(input.value);
            input.value = '';
        }
    });
    
    inputContainer.appendChild(input);
    inputContainer.appendChild(sendButton);
    gameContainer.appendChild(inputContainer);
}

async function sendMessage(text) {
    if (!text.trim()) return;
    
    const input = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    
    // Show player's message immediately
    showPlayerMessage(text);
    
    // Disable input while waiting
    input.disabled = true;
    sendButton.disabled = true;
    sendButton.textContent = '...';
    
    try {
        const response = await fetch(`${API_BASE}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text, thread_id: 'player1' })
        });
        
        const data = await response.json();
        
        // Show NPC response
        showDialogue(data.message);
        
        // Process game actions (like adding items)
        processActions(data.actions);
        
    } catch (error) {
        console.error('Error sending message:', error);
        showDialogue('连接错误，请重试...');
    } finally {
        // Re-enable input
        input.disabled = false;
        sendButton.disabled = false;
        sendButton.textContent = '发送';
        input.focus();
    }
}

function processActions(actions) {
    if (!actions || !actions.length) return;
    
    actions.forEach(action => {
        if (action.type === 'add_item') {
            addItemToHotbar(action.item, action.slot);
        } else if (action.type === 'remove_item') {
            removeItemFromHotbar(action.slot);
        }
    });
}

function addItemToHotbar(item, slotIndex) {
    if (slotIndex >= hotbarSlots.length) return;
    
    const slot = hotbarSlots[slotIndex];
    
    // Use item's icon from config (texture key matches the icon filename)
    const textureKey = item.icon || 'card.jpg';
    
    // Add item image to the slot (fit within 50x50 slot with padding)
    const itemImage = phaserScene.add.image(slot.x + 25, slot.y + 25, textureKey);
    itemImage.setDisplaySize(40, 40);
    
    // Store reference for removal
    slot.itemImage = itemImage;
    slot.item = item;
    
    // Add a subtle fade-in effect for new item
    itemImage.setAlpha(0);
    phaserScene.tweens.add({
        targets: itemImage,
        alpha: { from: 0, to: 1 },
        duration: 300,
        ease: 'Power2'
    });
}

function removeItemFromHotbar(slotIndex) {
    if (slotIndex >= hotbarSlots.length) return;
    
    const slot = hotbarSlots[slotIndex];
    if (slot.itemImage) {
        slot.itemImage.destroy();
        slot.itemImage = null;
        slot.item = null;
    }
}

function createHotbar(scene) {
    const slotSize = 50;
    const slotCount = 8;
    const slotGap = 4;
    const hotbarWidth = slotCount * slotSize + (slotCount - 1) * slotGap;
    const hotbarX = (1280 - hotbarWidth) / 2;
    const hotbarY = 720 - slotSize - 20;
    
    // Hotbar background (dark blue, semi-transparent)
    const hotbarBg = scene.add.graphics();
    hotbarBg.fillStyle(0x1a3a5c, 0.6);
    hotbarBg.fillRoundedRect(hotbarX - 8, hotbarY - 8, hotbarWidth + 16, slotSize + 16, 4);
    
    // Create 8 slots
    for (let i = 0; i < slotCount; i++) {
        const x = hotbarX + i * (slotSize + slotGap);
        const y = hotbarY;
        
        // Slot border (blue tint)
        const slot = scene.add.graphics();
        slot.fillStyle(0x4a7fb5, 0.8);
        slot.fillRect(x, y, slotSize, slotSize);
        
        // Inner area (darker blue, more transparent)
        slot.fillStyle(0x1e3a5f, 0.5);
        slot.fillRect(x + 2, y + 2, slotSize - 4, slotSize - 4);
        
        // Highlight edges (light blue top-left, dark blue bottom-right)
        slot.fillStyle(0x6a9fd5, 0.7);
        slot.fillRect(x + 2, y + 2, slotSize - 4, 2); // top
        slot.fillRect(x + 2, y + 2, 2, slotSize - 4); // left
        
        slot.fillStyle(0x0d2840, 0.8);
        slot.fillRect(x + 2, y + slotSize - 4, slotSize - 4, 2); // bottom
        slot.fillRect(x + slotSize - 4, y + 2, 2, slotSize - 4); // right
        
        // Store slot reference with position
        hotbarSlots.push({
            graphics: slot,
            x: x,
            y: y,
            itemImage: null,
            item: null
        });
    }
}
