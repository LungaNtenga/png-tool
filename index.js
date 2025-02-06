// Creating variables from HTML Id's
const selectFile = document.getElementById('select-file');
const uploadBtn = document.getElementById('real-file');
const customTxt = document.getElementById('custom-text');
const dropBox = document.getElementById('drop-upload');
const convertBtn = document.getElementById('convert-file');
const logoBtn = document.getElementById('logo');

// Customizig the messages or alerts of handlers
const MESSAGES = {
    UPLOAD_SUCCESS: "✨ File successfully uploaded!",
    SELECT_FILE: "No file chosen yet..",
    CONVERTING: "Converting your image to PNG...",
    DOWNLOAD_READY: "Your PNG is ready!",
    REPLACE: "Replace File",
    ERRORS: {
        NO_FILE: "Please select an image file first",
        NOT_IMAGE: "Oops! Please upload an image file (JPG, PNG, etc.)",
        CONVERSION_FAILED: "Sorry, couldn't convert your image. Please try again.",
        LOAD_FAILED: "Couldn't load your image. Is it corrupted?"
    }
};

// Initially hiding the convert button 
convertBtn.style.display = "none";

// Toast notification function
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Trigger reflow
    toast.offsetHeight;
    toast.classList.add('show');
    
    // Setting timing of the messages
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
}

// This is the function to reset everything to default after the download
function resetToDefault() {
    uploadBtn.value = ''; // Clear the file input
    customTxt.innerHTML = MESSAGES.SELECT_FILE; // Resets the custom text to default
    dropBox.textContent = MESSAGES.SELECT_FILE; // Reset the drop box text to default as well
    selectFile.textContent = "Choose File"; // Reset the select file button text
    convertBtn.style.display = "none"; // Hide the convert button
    localStorage.removeItem('uploadedFile'); // Remove the file from local storage
}

// Function to handle the being file upload
function handleFileUpload(file) {
    if (!file.type.endsWith('jpeg')) {
        showToast(MESSAGES.ERRORS.NOT_IMAGE, 'error');
        return; // This means the function will section from an uploaded file ends with jpeg (File type) in order to accept it.
    }
    
    const fileName = file.name;
    const reader = new FileReader();

    // Saving the file into the local storage
    reader.onload = function(e) {
        const fileData = {
            name: fileName,
            type: file.type,
            preview: e.target.result
        };
        
        localStorage.setItem('uploadedFile', JSON.stringify(fileData));

         // This is for changing the customize text by replacing it with the file contents (The image and name)
        customTxt.innerHTML = `
            <div class="file-preview">
                <img src="${e.target.result}" alt="${fileName}" style="max-width: 50px; max-height: 50px; border-radius: 4px;">
                <span>${fileName}</span>
            </div>`;
            
        dropBox.textContent = MESSAGES.UPLOAD_SUCCESS;
        selectFile.textContent = MESSAGES.REPLACE;
        convertBtn.style.display = "inline-block";
        
        showToast(MESSAGES.UPLOAD_SUCCESS);
    };
    
    reader.onerror = () => showToast(MESSAGES.ERRORS.LOAD_FAILED, 'error');
    reader.readAsDataURL(file);
}

// This is a function to convert image to PNG
async function convertToPNG(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        // I created a canvas element into the HTML, to have the same properties as the img element within the customText.innerHTML
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error(MESSAGES.ERRORS.CONVERSION_FAILED));
                }
            // Saving the file into a blob (png)
            }, 'image/png');
        };
        
        img.onerror = () => reject(new Error(MESSAGES.ERRORS.LOAD_FAILED));
        
        const reader = new FileReader();
        reader.onload = (e) => {
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error(MESSAGES.ERRORS.LOAD_FAILED));
        reader.readAsDataURL(file);
    });
}

// This function to shows the loader or HTML Loader 
function showLoader() {
    const originalText = convertBtn.textContent;
    convertBtn.innerHTML = `
        <div class="convert-loader">
            <div class="spinner"></div>
            <span class="loader-text">${MESSAGES.CONVERTING}</span>
        </div>
        <div class="progress-bar">
            <div class="progress-bar-fill"></div>
        </div>`;
    convertBtn.classList.add('convert-btn-loading');
    convertBtn.disabled = true;

    // Simulate progress bar
    const progressBar = convertBtn.querySelector('.progress-bar-fill');
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 90) clearInterval(interval);
        progressBar.style.width = Math.min(progress, 90) + '%';
    }, 200);

    return () => {
        clearInterval(interval);
        progressBar.style.width = '100%';
        setTimeout(() => {
            convertBtn.innerHTML = originalText;
            convertBtn.classList.remove('convert-btn-loading');
            convertBtn.disabled = false;
            showToast(MESSAGES.DOWNLOAD_READY);
        }, 300);
    };
}


// This checks for saved file whenever the screen is loaded //Remembers how the HTML element should be like when reloaded
function restoreFileDetails() {
    const savedFile = localStorage.getItem('uploadedFile');
    if (savedFile) {
        const fileData = JSON.parse(savedFile);
        customTxt.innerHTML = `
            <div class="file-preview">
                <img src="${fileData.preview}" alt="${fileData.name}" style="max-width: 50px; max-height: 50px; border-radius: 4px;">
                <span>${fileData.name}</span>
            </div>`;
        dropBox.textContent = MESSAGES.UPLOAD_SUCCESS;
        selectFile.textContent = MESSAGES.REPLACE;
        convertBtn.style.display = "inline-block";
    }
}

// These are the event Listeners
document.addEventListener('DOMContentLoaded', restoreFileDetails);

selectFile.addEventListener('click', function() {
    uploadBtn.click();
});

uploadBtn.addEventListener('change', function() {
    if (uploadBtn.value) {
        const file = uploadBtn.files[0];
        handleFileUpload(file);
        
    } else {
        customTxt.innerHTML = MESSAGES.SELECT_FILE;
        localStorage.removeItem('uploadedFile');
    }
});

// Listeners for the dropbox
dropBox.addEventListener('click', function() {
    uploadBtn.click();
});

dropBox.addEventListener('dragenter', function(e) {
    e.preventDefault();
    this.classList.add('drag-active');
});

dropBox.addEventListener('dragleave', function(e) {
    e.preventDefault();
    this.classList.remove('drag-active');
});

dropBox.addEventListener('dragover', function(e) {
    e.preventDefault();
    this.classList.add('drag-active');
});

dropBox.addEventListener('drop', function(e) {
    e.preventDefault();
    this.classList.remove('drag-active');
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
        uploadBtn.files = files;
        handleFileUpload(files[0]);
    }
});

// Listener for the log button to reset to default
logoBtn.addEventListener('click',function(){
        resetToDefault();
    } )


// Listeners for the convert button 
convertBtn.addEventListener('click', async function() {
    const file = uploadBtn.files[0];
    if (!file) {
        showToast(MESSAGES.ERRORS.NO_FILE, 'error');
        return;
    }

    if (!file.type.startsWith('image/')) {
        showToast(MESSAGES.ERRORS.NOT_IMAGE, 'error');
        return;
    }

    if (!file.type.endsWith('jpeg')) {
        showToast(MESSAGES.ERRORS.NOT_IMAGE, 'error');
        return;
    }

    const resetLoader = showLoader();

    try {
        const pngBlob = await convertToPNG(file);
        downloadFile(pngBlob, file.name);
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        resetLoader();
    }


});

// This is a function to download file 
function downloadFile(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // Regex
    a.download = fileName.replace(/\.[^/.]+$/, '') + '.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // This is a call for a function to reset everything to default after download after certain seconds
    setTimeout(() => {
        resetToDefault();
    }, 1000);
    
   
};
// Thank you for viewing my code!!!
