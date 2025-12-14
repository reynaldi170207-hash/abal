let selectedForDelete = [];
let customFolders = [];
let currentScanData = null;

// Fungsi Navigasi
function showScanner() {
    document.getElementById("scanner").classList.remove("hidden");
    document.getElementById("tutorial").classList.add("hidden");
    document.getElementById("homePage").classList.add("hidden");
    document.getElementById("driveSelection").classList.add("hidden");
    document.getElementById("duplicateFinder").classList.add("hidden");
}

function showTutorial() {
    document.getElementById("tutorial").classList.remove("hidden");
    document.getElementById("scanner").classList.add("hidden");
    document.getElementById("homePage").classList.add("hidden");
    document.getElementById("driveSelection").classList.add("hidden");
    document.getElementById("duplicateFinder").classList.add("hidden");
}

function showHome() {
    document.getElementById("tutorial").classList.add("hidden");
    document.getElementById("scanner").classList.add("hidden");
    document.getElementById("homePage").classList.remove("hidden");
    document.getElementById("driveSelection").classList.add("hidden");
    document.getElementById("duplicateFinder").classList.add("hidden");
}

function showDriveSelection() {
    document.getElementById("driveSelection").classList.remove("hidden");
    document.getElementById("homePage").classList.add("hidden");
    document.getElementById("tutorial").classList.add("hidden");
    document.getElementById("scanner").classList.add("hidden");
    document.getElementById("duplicateFinder").classList.add("hidden");
    
    setupDriveSelection();
}

function showDuplicateFinder() {
    document.getElementById("duplicateFinder").classList.remove("hidden");
    document.getElementById("homePage").classList.add("hidden");
    document.getElementById("tutorial").classList.add("hidden");
    document.getElementById("scanner").classList.add("hidden");
    document.getElementById("driveSelection").classList.add("hidden");
}

// Fungsi Pemilihan Drive
function setupDriveSelection() {
    const drivesContainer = document.getElementById("driveCheckboxes");
    
    const drives = [
        { letter: "C:", name: "System Drive", default: true },
        { letter: "D:", name: "Data Drive", default: false },
        { letter: "E:", name: "Extra Drive", default: false },
        { letter: "F:", name: "External Drive", default: false }
    ];
    
    let html = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px;">';
    
    drives.forEach(drive => {
        html += `
            <div class="drive-option ${drive.default ? 'selected' : ''}" onclick="toggleDrive('${drive.letter}')">
                <input type="checkbox" id="drive_${drive.letter}" ${drive.default ? 'checked' : ''} 
                       value="${drive.letter}" style="display: none;">
                <strong>${drive.letter}</strong><br>
                <small>${drive.name}</small>
            </div>
        `;
    });
    
    html += '</div>';
    html += '<p style="margin-top: 10px;"><small>Scanner akan mendeteksi drive yang tersedia secara otomatis</small></p>';
    
    drivesContainer.innerHTML = html;
    customFolders = [];
    updateCustomFoldersList();
}

function toggleDrive(driveLetter) {
    const checkbox = document.getElementById(`drive_${driveLetter}`);
    const driveOption = checkbox.closest('.drive-option');
    
    checkbox.checked = !checkbox.checked;
    if (checkbox.checked) {
        driveOption.classList.add('selected');
    } else {
        driveOption.classList.remove('selected');
    }
}

// Fungsi Folder Kustom
function addCustomFolder() {
    const folderInput = document.getElementById("customFolder");
    const folder = folderInput.value.trim();
    
    if (!folder) {
        alert("Silakan masukkan path folder!");
        return;
    }
    
    if (!folder.includes(":\\") && !folder.startsWith("\\\\")) {
        alert("Format folder tidak valid! Gunakan format seperti: D:\\Folder atau \\\\Server\\Share");
        return;
    }
    
    if (!customFolders.includes(folder)) {
        customFolders.push(folder);
        updateCustomFoldersList();
        folderInput.value = "";
    } else {
        alert("Folder sudah ditambahkan!");
    }
}

function updateCustomFoldersList() {
    const listDiv = document.getElementById("customFoldersList");
    
    if (customFolders.length === 0) {
        listDiv.innerHTML = '<div style="color: #666; font-style: italic;">Belum ada folder kustom ditambahkan</div>';
        return;
    }
    
    let html = '<div style="max-height: 150px; overflow-y: auto;">';
    customFolders.forEach((folder, index) => {
        html += `
            <div class="file-item" style="display: flex; justify-content: space-between; align-items: center;">
                <span>${folder}</span>
                <button onclick="removeCustomFolder(${index})" class="btn" style="padding: 2px 8px; font-size: 12px;">Hapus</button>
            </div>
        `;
    });
    html += '</div>';
    listDiv.innerHTML = html;
}

function removeCustomFolder(index) {
    customFolders.splice(index, 1);
    updateCustomFoldersList();
}

// Fungsi Builder Konfigurasi
function buildConfigObject() {
    const isDuplicateFinder = !document.getElementById("duplicateFinder").classList.contains("hidden");
    const isDriveSelection = !document.getElementById("driveSelection").classList.contains("hidden");
    
    let drives = [];
    let scanOptions = {};
    
    if (isDuplicateFinder) {
        const driveCheckboxes = document.querySelectorAll('#dupDriveCheckboxes input[type="checkbox"]');
        drives = Array.from(driveCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);
        
        scanOptions = {
            large_files_threshold_mb: 100,
            include_temp: false,
            include_logs: false,
            scan_downloads: true,
            scan_documents: true,
            scan_root: true,
            find_duplicates: true,
            min_duplicate_size_kb: parseInt(document.getElementById("minDuplicateSize").value) || 100,
            duplicate_file_types: Array.from(document.querySelectorAll('.dup-file-type:checked')).map(cb => cb.value)
        };
    } else if (isDriveSelection) {
        const driveCheckboxes = document.querySelectorAll('#driveCheckboxes input[type="checkbox"]:checked');
        drives = Array.from(driveCheckboxes).map(cb => cb.value);
        
        scanOptions = {
            large_files_threshold_mb: parseInt(document.getElementById("thresholdMB2").value) || 100,
            include_temp: document.getElementById("scanTemp").checked,
            include_logs: document.getElementById("scanLogs").checked,
            scan_downloads: document.getElementById("scanDownloads").checked,
            scan_documents: document.getElementById("scanDocuments").checked,
            scan_root: document.getElementById("scanRoot").checked,
            find_duplicates: document.getElementById("findDuplicates").checked,
            min_duplicate_size_kb: parseInt(document.getElementById("thresholdMB").value) || 100,
            duplicate_file_types: ["all"]
        };
    } else {
        drives = ["C:"];
        scanOptions = {
            large_files_threshold_mb: 100,
            include_temp: true,
            include_logs: true,
            scan_downloads: true,
            scan_documents: true,
            scan_root: false,
            find_duplicates: false
        };
    }
    
    const allPossibleDrives = ["C:", "D:", "E:", "F:"];
    const scanAllDrives = allPossibleDrives.every(drive => 
        drives.includes(drive)
    );
    
    return {
        scan_config: {
            drives: drives,
            custom_folders: customFolders,
            scan_all_drives: scanAllDrives,
            scan_options: scanOptions
        }
    };
}

function generateConfigAndDownload() {
    const config = buildConfigObject();
    
    if (config.scan_config.drives.length === 0 && config.scan_config.custom_folders.length === 0) {
        alert("Silakan pilih minimal satu drive atau tambahkan folder kustom!");
        return;
    }
    
    const blob = new Blob([JSON.stringify(config, null, 4)], {type: "application/json"});
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "scan_config.json";
    link.click();
    
    alert("scan_config.json telah dibuat!\n\nLangkah selanjutnya:\n1. Download scanner.exe (jika belum)\n2. Taruh scanner.exe dan scan_config.json di folder yang sama\n3. Jalankan scanner.exe\n4. Upload scan_result.json ke website ini");
    showScanner();
}

// Fungsi Pencari Duplikat
function startDuplicateScan() {
    const driveCheckboxes = document.querySelectorAll('#dupDriveCheckboxes input[type="checkbox"]');
    const drives = Array.from(driveCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
    
    if (drives.length === 0) {
        alert("❌ Silakan pilih minimal satu drive untuk scan duplikat!");
        return;
    }
    
    const fileTypeCheckboxes = document.querySelectorAll('.dup-file-type:checked');
    const fileTypes = Array.from(fileTypeCheckboxes).map(cb => cb.value);
    
    const minSize = parseInt(document.getElementById("minDuplicateSize").value) || 100;
    
    const config = {
        scan_config: {
            drives: drives,
            custom_folders: [],
            scan_all_drives: false,
            scan_options: {
                large_files_threshold_mb: 100,
                include_temp: false,
                include_logs: false,
                scan_downloads: true,
                scan_documents: true,
                scan_root: true,
                find_duplicates: true,
                min_duplicate_size_kb: minSize,
                duplicate_file_types: fileTypes
            }
        }
    };
    
    const blob = new Blob([JSON.stringify(config, null, 4)], {type: "application/json"});
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "scan_config.json";
    link.click();
    
    document.getElementById("duplicateResults").innerHTML = `
        <div class="success-message">
            <h3>✅ Konfigurasi Berhasil Dibuat!</h3>
            <div style="background: #c3e6cb; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <p><strong>Drive yang akan discan:</strong> ${drives.join(', ')}</p>
                <p><strong>Jenis file:</strong> ${fileTypes.join(', ')}</p>
                <p><strong>Ukuran file minimum:</strong> ${minSize} KB</p>
            </div>
            
            <h4>📋 Langkah Selanjutnya:</h4>
            <ol>
                <li><button class="btn" onclick="downloadScanner()">Download scanner.exe</button> (jika belum)</li>
                <li>Taruh <strong>scanner.exe</strong> dan <strong>scan_config.json</strong> di folder yang sama</li>
                <li>Jalankan <strong>scanner.exe</strong> (double-click)</li>
                <li>Hasil akan disimpan sebagai <strong>scan_result.json</strong></li>
                <li>Kembali ke halaman ini dan upload scan_result.json</li>
            </ol>
            
            <div style="margin-top: 20px;">
                <button class="btn" onclick="showScanner()">Pergi ke Halaman Scanner</button>
                <button class="btn btn-secondary" onclick="showHome()">Kembali ke Beranda</button>
            </div>
        </div>
    `;
}

// Fungsi Scanner
function downloadScanner() {
    window.location.href = "downloads/scanner.exe";
}

function downloadCleaner() {
    window.location.href = "downloads/cleaner.exe";
}

function loadScanResult() {
    const file = document.getElementById("jsonFile").files[0];
    if (!file) {
        alert("Silakan pilih file scan_result.json terlebih dahulu!");
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            currentScanData = JSON.parse(e.target.result);
            displayResult(currentScanData);
            drawChart(currentScanData);
            calculateDSDT(currentScanData);
        } catch (error) {
            alert("Error parsing file JSON: " + error.message);
        }
    };
    reader.readAsText(file);
}

// Fungsi Tampilan Hasil
function displayResult(data) {
    selectedForDelete = [];
    let html = `<h2>📊 Hasil Scan</h2>`;
    
    // Info scan
    html += `<div class="scan-info">`;
    html += `<p><strong>Waktu Scan:</strong> ${data.generated_at || 'Tidak tersedia'}</p>`;
    html += `<p><strong>Durasi:</strong> ${data.scan_time_sec || 0} detik</p>`;
    html += `<p><strong>File yang discan:</strong> ${data.files_scanned || 0}</p>`;
    
    if (data.scan_config) {
        const drives = data.scan_config.drives || [];
        if (drives.length > 0) {
            html += `<p><strong>Drive yang discan:</strong> ${drives.join(', ')}</p>`;
        }
    }
    html += `</div>`;
    
    // Info storage
    if (data.storage_info && Object.keys(data.storage_info).length > 0) {
        html += `<h3>💾 Ringkasan Penyimpanan</h3>`;
        html += `<div class="storage-summary">`;
        
        for (const [drive, info] of Object.entries(data.storage_info)) {
            const usedPercent = info.percentage || (info.used / info.total * 100);
            const driveClass = `drive-${drive.toLowerCase().replace(':', '')}`;
            
            html += `
                <div class="storage-card ${driveClass}">
                    <h4>Drive ${drive}</h4>
                    <p><strong>Terpakai:</strong> ${formatBytes(info.used)}</p>
                    <p><strong>Kosong:</strong> ${formatBytes(info.free)}</p>
                    <p><strong>Total:</strong> ${formatBytes(info.total)}</p>
                    <div class="usage-bar">
                        <div class="usage-fill" style="width: ${Math.min(usedPercent, 100)}%; 
                             background: ${usedPercent > 80 ? '#e74c3c' : (usedPercent > 60 ? '#f39c12' : '#2ecc71')};">
                        </div>
                    </div>
                    <p>${usedPercent.toFixed(1)}% terpakai</p>
                </div>
            `;
        }
        html += `</div>`;
    }
    
    // File besar
    html += `<h3>📦 File Besar (> ${data.scan_config?.scan_options?.large_files_threshold_mb || 100}MB)</h3>`;
    
    if (data.large_files && data.large_files.length > 0) {
        html += `<p><strong>Total:</strong> ${data.large_files.length} file</p>`;
        html += `<div class="file-list">`;
        
        data.large_files.forEach((f, index) => {
            const drive = f.drive || f.path.substring(0, 2);
            html += `
                <label class="file-item">
                    <input type="checkbox" value="${f.path}" onclick="toggleFile(this)">
                    <strong>[${drive}]</strong> ${f.path}<br>
                    <span class="file-size">${formatBytes(f.size)}</span>
                </label>
            `;
        });
        html += `</div>`;
    } else {
        html += `<p class="no-data">Tidak ditemukan file besar.</p>`;
    }
    
    // File duplikat
    if (data.duplicate_files && data.duplicate_files.duplicate_groups) {
        html += displayDuplicateFiles(data.duplicate_files);
    }
    
    // File sampah
    let totalJunk = 0;
    let totalJunkCount = 0;
    for (let cat in data.junk_files) {
        data.junk_files[cat].forEach(f => {
            totalJunk += f.size;
            totalJunkCount++;
        });
    }
    
    html += `<h3>🗑️ File Sampah — Total: ${formatBytes(totalJunk)} (${totalJunkCount} file)</h3>`;
    
    if (totalJunkCount > 0) {
        html += `<label class="select-all">
            <input type="checkbox" id="selectAllJunk" onclick="toggleAllJunk(this)"> 
            <strong>Pilih Semua File Sampah</strong>
        </label>`;
        
        for (let cat in data.junk_files) {
            if (data.junk_files[cat].length === 0) continue;
            
            let catTotal = 0;
            data.junk_files[cat].forEach(f => catTotal += f.size);
            
            html += `
                <button class="collapsible">${cat.toUpperCase()} — ${formatBytes(catTotal)} (${data.junk_files[cat].length} file)</button>
                <div class="content">
                    <label class="select-category">
                        <input type="checkbox" class="catCheckbox" data-cat="${cat}" onclick="toggleCategory(this,'${cat}')">
                        <strong>Pilih semua ${cat.toUpperCase()} (${data.junk_files[cat].length} file)</strong>
                    </label>
            `;
            
            data.junk_files[cat].forEach(f => {
                const drive = f.drive || f.path.substring(0, 2);
                html += `
                    <label class="file-item">
                        <input type="checkbox" value="${f.path}" class="fileCheckbox" data-cat="${cat}" onclick="toggleFile(this)">
                        [${drive}] ${f.path}<br>
                        <span class="file-size">${formatBytes(f.size)}</span>
                    </label>
                `;
            });
            
            html += `</div>`;
        }
    } else {
        html += `<p class="no-data">Tidak ditemukan file sampah.</p>`;
    }
    
    // Ringkasan
    html += `<div class="summary">`;
    html += `<h4>📈 Ringkasan:</h4>`;
    html += `<p>Total penyimpanan yang discan: ${formatBytes(data.total_size || 0)}</p>`;
    html += `<p>File besar ditemukan: ${data.large_files?.length || 0}</p>`;
    html += `<p>File sampah ditemukan: ${totalJunkCount}</p>`;
    if (data.duplicate_files?.total_groups) {
        html += `<p>Grup duplikat: ${data.duplicate_files.total_groups}</p>`;
        html += `<p>Ruang yang bisa dihemat dari duplikat: ${formatBytes(data.duplicate_files.total_wasted_space)}</p>`;
    }
    html += `<p>File yang dipilih untuk penghapusan: <span id="selectedCount">0</span></p>`;
    html += `</div>`;
    
    document.getElementById("result").innerHTML = html;
    document.getElementById("cleanBtn").style.display = "block";
    
    // Setup collapsible sections
    const coll = document.getElementsByClassName("collapsible");
    for (let i = 0; i < coll.length; i++) {
        coll[i].addEventListener("click", function() {
            this.classList.toggle("active");
            const content = this.nextElementSibling;
            content.style.display = content.style.display === "block" ? "none" : "block";
        });
    }
    
    updateSelectedCount();
}

function displayDuplicateFiles(duplicateData) {
    if (!duplicateData || duplicateData.duplicate_groups.length === 0) {
        return '<p class="no-data">Tidak ditemukan file duplikat.</p>';
    }
    
    let html = `
        <div class="duplicate-header">
            <h3>📁 File Duplikat Ditemukan</h3>
            <div class="duplicate-stats">
                <div class="stat-card">
                    <div class="stat-value">${duplicateData.total_groups}</div>
                    <div>Grup Duplikat</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${duplicateData.total_duplicate_files}</div>
                    <div>File Duplikat</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${formatBytes(duplicateData.total_wasted_space)}</div>
                    <div>Ruang Terbuang</div>
                </div>
            </div>
            <div class="duplicate-actions">
                <button class="btn" onclick="selectAllDuplicates()">Pilih Semua Duplikat</button>
                <button class="btn" onclick="smartSelectDuplicates()">Pilih Cerdas (Simpan Terbaru)</button>
                <button class="btn" onclick="selectLargestDuplicates()">Pilih File Terbesar</button>
            </div>
        </div>
    `;
    
    duplicateData.duplicate_groups.forEach((group, groupIndex) => {
        html += `
            <div class="duplicate-group">
                <div class="group-header">
                    <h4>Grup ${groupIndex + 1} - ${group.count} duplikat (${formatBytes(group.wasted_space)} terbuang)</h4>
                    <button class="btn" onclick="selectDuplicateGroup(${groupIndex})">Pilih Semua dalam Grup</button>
                </div>
                <div class="hash-display">Hash: ${group.hash.substring(0, 16)}...</div>
        `;
        
        group.files.sort((a, b) => new Date(b.modified_str) - new Date(a.modified_str));
        
        group.files.forEach((file, fileIndex) => {
            const isNewest = fileIndex === 0;
            html += `
                <div class="duplicate-file ${isNewest ? 'keep-file' : 'delete-file'}">
                    <label>
                        <input type="checkbox" value="${file.path}" 
                               ${isNewest ? 'disabled' : 'checked'} 
                               class="duplicate-checkbox" 
                               data-group="${groupIndex}"
                               data-size="${file.size}"
                               data-modified="${file.modified}"
                               onclick="toggleFile(this)">
                        <span class="file-path">${file.path}</span>
                        <span class="file-info">
                            ${formatBytes(file.size)} | Dimodifikasi: ${file.modified_str}
                            ${isNewest ? ' <span class="keep-badge">(SIMPAN - Terbaru)</span>' : ' <span class="delete-badge">(HAPUS)</span>'}
                        </span>
                    </label>
                </div>
            `;
        });
        
        html += `</div>`;
    });
    
    return html;
}

// Fungsi Seleksi Duplikat
function selectAllDuplicates() {
    const checkboxes = document.querySelectorAll('.duplicate-checkbox:not(:disabled)');
    checkboxes.forEach(cb => {
        cb.checked = true;
        toggleFile(cb);
    });
    updateSelectedCount();
    showNotification(`Memilih ${checkboxes.length} file duplikat untuk penghapusan`);
}

function smartSelectDuplicates() {
    const groups = {};
    
    document.querySelectorAll('.duplicate-checkbox').forEach(cb => {
        const group = cb.dataset.group;
        if (!groups[group]) groups[group] = [];
        groups[group].push(cb);
    });
    
    Object.values(groups).forEach(groupCheckboxes => {
        groupCheckboxes.sort((a, b) => {
            return new Date(b.dataset.modified) - new Date(a.dataset.modified);
        });
        
        groupCheckboxes.forEach(cb => {
            cb.checked = false;
            toggleFile(cb);
        });
        
        groupCheckboxes.slice(1).forEach(cb => {
            if (!cb.disabled) {
                cb.checked = true;
                toggleFile(cb);
            }
        });
    });
    
    updateSelectedCount();
    showNotification("Seleksi cerdas selesai: Menyimpan file terbaru di setiap grup");
}

function selectLargestDuplicates() {
    const groups = {};
    
    document.querySelectorAll('.duplicate-checkbox').forEach(cb => {
        const group = cb.dataset.group;
        if (!groups[group]) groups[group] = [];
        groups[group].push(cb);
    });
    
    Object.values(groups).forEach(groupCheckboxes => {
        groupCheckboxes.sort((a, b) => {
            return parseInt(b.dataset.size) - parseInt(a.dataset.size);
        });
        
        groupCheckboxes.forEach(cb => {
            cb.checked = false;
            toggleFile(cb);
        });
        
        groupCheckboxes.slice(1).forEach(cb => {
            if (!cb.disabled) {
                cb.checked = true;
                toggleFile(cb);
            }
        });
    });
    
    updateSelectedCount();
    showNotification("Seleksi selesai: Menyimpan file terbesar di setiap grup");
}

function selectDuplicateGroup(groupIndex) {
    const checkboxes = document.querySelectorAll(`.duplicate-checkbox[data-group="${groupIndex}"]:not(:disabled)`);
    checkboxes.forEach(cb => {
        cb.checked = true;
        toggleFile(cb);
    });
    updateSelectedCount();
    showNotification(`Memilih ${checkboxes.length} file dalam grup ${parseInt(groupIndex) + 1}`);
}

// Fungsi Seleksi File
function toggleFile(checkbox) {
    if (checkbox.checked) {
        if (!selectedForDelete.includes(checkbox.value)) {
            selectedForDelete.push(checkbox.value);
        }
    } else {
        selectedForDelete = selectedForDelete.filter(x => x !== checkbox.value);
    }
    updateSelectedCount();
}

function toggleCategory(catCheckbox, cat) {
    const checkboxes = document.querySelectorAll(`.fileCheckbox[data-cat='${cat}']`);
    checkboxes.forEach(cb => {
        cb.checked = catCheckbox.checked;
        toggleFile(cb);
    });
}

function toggleAllJunk(masterCheckbox) {
    const allCatBoxes = document.querySelectorAll(".catCheckbox");
    allCatBoxes.forEach(cb => {
        cb.checked = masterCheckbox.checked;
        toggleCategory(cb, cb.dataset.cat);
    });
}

function updateSelectedCount() {
    const countElement = document.getElementById("selectedCount");
    if (countElement) {
        countElement.textContent = selectedForDelete.length;
        countElement.style.color = selectedForDelete.length > 0 ? "#e74c3c" : "#333";
    }
}

// Fungsi Cleaner
function generateDeleteJSON() {
    if (selectedForDelete.length === 0) {
        alert("Pilih minimal satu file untuk dihapus!");
        return false;
    }
    
    const blob = new Blob([JSON.stringify(selectedForDelete, null, 4)], {type: "application/json"});
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "delete_request.json";
    link.click();
    return true;
}

function runCleaner() {
    if (!generateDeleteJSON()) {
        return;
    }
    
    alert("delete_request.json telah dibuat!\n\nLangkah selanjutnya:\n1. Download cleaner.exe (jika belum)\n2. Taruh cleaner.exe dan delete_request.json di folder yang sama\n3. Jalankan cleaner.exe untuk menghapus file\n\nPERINGATAN: Pastikan Anda tidak memilih file system!");
}

// Fungsi Utility
function showNotification(message) {
    const notification = document.createElement("div");
    notification.className = "notification";
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function formatBytes(bytes) {
    if (bytes === 0) return "0 B";
    if (bytes < 0) return "-" + formatBytes(-bytes);
    
    const units = ["B", "KB", "MB", "GB", "TB"];
    let i = 0;
    while (bytes >= 1024 && i < units.length - 1) {
        bytes /= 1024;
        i++;
    }
    return bytes.toFixed(2) + " " + units[i];
}

function formatTime(seconds) {
    if (seconds < 60) {
        return seconds + " detik";
    } else if (seconds < 3600) {
        return (seconds / 60).toFixed(1) + " menit";
    } else if (seconds < 86400) {
        return (seconds / 3600).toFixed(1) + " jam";
    } else {
        return (seconds / 86400).toFixed(1) + " hari";
    }
}

// Fungsi Chart
function drawChart(data) {
    const ctx = document.getElementById("lineChart");
    if (!ctx) return;
    
    if (!data.storage_history || data.storage_history.length < 2) {
        ctx.style.display = "none";
        return;
    }
    
    ctx.style.display = "block";
    
    const labels = data.storage_history.map(h => 
        new Date(h.time * 1000).toLocaleDateString() + ' ' + 
        new Date(h.time * 1000).toLocaleTimeString()
    );
    
    const values = data.storage_history.map(h => {
        if (h.storage_info) {
            return Object.values(h.storage_info).reduce((sum, info) => sum + (info.used || 0), 0);
        }
        return h.used_storage || 0;
    });
    
    if (window.storageChart) {
        window.storageChart.destroy();
    }
    
    window.storageChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Penyimpanan Terpakai",
                data: values,
                borderColor: "#3498db",
                backgroundColor: "rgba(52, 152, 219, 0.1)",
                borderWidth: 2,
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Terpakai: ${formatBytes(context.raw)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: function(value) {
                            return formatBytes(value);
                        }
                    }
                }
            }
        }
    });
}

function calculateDSDT(data) {
    const hist = data.storage_history;
    if (!hist || hist.length < 2) {
        document.getElementById("dsdtBox").innerHTML = "";
        return;
    }
    
    const s2 = hist[hist.length - 1].total_size || 0;
    const s1 = hist[hist.length - 2].total_size || 0;
    const t2 = hist[hist.length - 1].time;
    const t1 = hist[hist.length - 2].time;
    
    const ds = s2 - s1;
    const dt = t2 - t1;
    
    if (dt === 0) {
        document.getElementById("dsdtBox").innerHTML = `<h3>Perhitungan ds/dt</h3><p>Tidak ada perbedaan waktu antara scan.</p>`;
        return;
    }
    
    const dsdt = ds / dt;
    
    let html = `<div class="dsdt-box">`;
    html += `<h3>📈 Analisis Pertumbuhan Penyimpanan</h3>`;
    html += `<p><strong>Perubahan penyimpanan (ds):</strong> ${formatBytes(ds)}</p>`;
    html += `<p><strong>Perubahan waktu (dt):</strong> ${formatTime(dt)}</p>`;
    html += `<p><strong>Laju pertumbuhan (ds/dt):</strong> ${formatBytes(dsdt)}/detik</p>`;
    
    if (dsdt > 5 * 1024 * 1024) {
        html += `<p class="warning-high">⚠️ PERTUMBUHAN TINGGI! Penyimpanan meningkat cepat.</p>`;
    } else if (dsdt > 1 * 1024 * 1024) {
        html += `<p class="warning-medium">⚠️ Pertumbuhan sedang. Pantau penggunaan penyimpanan.</p>`;
    } else if (dsdt < 0) {
        html += `<p class="success">✓ Penyimpanan berkurang. Pembersihan berhasil!</p>`;
    } else {
        html += `<p class="success">✓ Laju pertumbuhan normal.</p>`;
    }
    
    html += `</div>`;
    document.getElementById("dsdtBox").innerHTML = html;
}

// Inisialisasi
document.addEventListener("DOMContentLoaded", function() {
    console.log("My Storage Scanner v2.0 berhasil dimuat");
});

// Fungsi Navigasi - Tambahkan fungsi ini bersama fungsi show lainnya
function showDerivativeAnalysis() {
    document.getElementById("derivativeAnalysis").classList.remove("hidden");
    document.getElementById("tutorial").classList.add("hidden");
    document.getElementById("homePage").classList.add("hidden");
    document.getElementById("driveSelection").classList.add("hidden");
    document.getElementById("duplicateFinder").classList.add("hidden");
    document.getElementById("scanner").classList.add("hidden");
}