let currentShip = "";
let stokTangki = 0;
let drumData = [];
let requestData = {};
const WEB_APP_URL ="https://script.google.com/macros/s/AKfycbwCjBJQB3MgdBKa2FTH8ZmKXtfXmq1FhomVgcGWTQkUqQQMFnTqC7qSD-ft-_eZtMrS/exec";
let isSubmittingRequest = false;
let robCurrentMonth = new Date();
let robSelectedDate = new Date();
let robCurrentStep = "calendar";
let robMasterKapal = [];
let robSelectedShip = null;
let robKapalSelesai = [];

window.onload = function () {

    loadRequestStatus();

    loadStokTangki();

    loadDrumData();

    loadPinjamData();
    loadRiwayatData();
    loadRobMasterData();
    renderRobViews();

};

function openShip(ship) {
currentShip = ship;

document.getElementById("shipPage").style.display = "none";
document.getElementById("formPage").style.display = "block";
document.getElementById("shipTitle").innerHTML = ship;

const requestForm = document.getElementById("requestForm");

if (requestData[ship]) {

    document.getElementById("requestId").value =
        requestData[ship].requestId;

    document.getElementById("permintaan").value = requestData[ship].permintaan;
    document.getElementById("rob").value = requestData[ship].rob;
    document.getElementById("rencana").value = requestData[ship].rencana;

    document.getElementById("permintaan").readOnly = true;
    document.getElementById("rob").readOnly = true;
    document.getElementById("rencana").readOnly = true;

    document.getElementById("file").disabled = true;

    requestForm.style.display = "block";

    document.getElementById("btnRequest").style.display = "none";
    document.getElementById("btnRealisasi").style.display = "block";

    document.getElementById("realisasiSection")
        .classList.remove("hidden");

} else {

    requestForm.reset();

    document.getElementById("permintaan").readOnly = false;
    document.getElementById("rob").readOnly = false;
    document.getElementById("rencana").readOnly = false;

    document.getElementById("file").disabled = false;

    requestForm.style.display = "block";

    document.getElementById("btnRequest").style.display = "block";
    document.getElementById("btnRealisasi").style.display = "none";

    document.getElementById("realisasiSection")
        .classList.add("hidden");
}
}

function closeForm() {
document.getElementById("shipPage").style.display = "block";
document.getElementById("formPage").style.display = "none";
}

function openTankForm(){

document.getElementById("shipPage").style.display="none";

document.getElementById("formPage").style.display="none";

document.getElementById("tankForm").style.display="block";

}

function closeTankForm(){

document.getElementById("tankForm").style.display="none";

document.getElementById("shipPage").style.display="block";

}

document.getElementById("requestForm")
.addEventListener("submit", function(e) {

e.preventDefault();

if(isSubmittingRequest){
    return;
}

isSubmittingRequest = true;

document.getElementById("btnRequest").disabled = true;

document.getElementById("overlay").style.display="flex";

document.getElementById("loader").style.display="block";

document.getElementById("checkmark").style.display="none";

document.getElementById("successText").style.display="block";

document.getElementById("successText").innerHTML="Menyimpan Request...";

const fileInput =
    document.getElementById("file");

const file =
    fileInput.files[0];

if (!file) {

    alert("Silakan pilih file RL");

    return;
}

const reader = new FileReader();

reader.onload = function() {

    const base64 =
        reader.result.split(",")[1];

        const data = {

        jenis: "REQUEST",

        namaKapal: currentShip,

        permintaan:
            document.getElementById("permintaan").value,

        rob:
            document.getElementById("rob").value,

        rencana:
            document.getElementById("rencana").value,

        fileName:
            file.name,

        mimeType:
            file.type,

        imageBase64:
            base64

    };

    fetch(WEB_APP_URL, {

        method: "POST",

        headers: {
            "Content-Type": "text/plain;charset=utf-8"
        },

        body: JSON.stringify(data)

    })

    .then(response => response.json())
    .then(result => {

        console.log(result);

        if (result.success) {

            document.getElementById("requestId").value =
                result.requestId;

            document.getElementById("loader").style.display="none";

            document.getElementById("checkmark").style.display="block";

            document.getElementById("successText").innerHTML=
            "Request berhasil disimpan";

            requestData[currentShip] = {

                requestId: result.requestId,

                permintaan:
                    document.getElementById("permintaan").value,

                rob:
                    document.getElementById("rob").value,

                rencana:
                    document.getElementById("rencana").value,

                status: "REQUEST"
            };

            document.getElementById(
            "alert-"+currentShip
            ).style.display="block";

            setTimeout(function(){

                document.getElementById("overlay").style.display="none";

                closeForm();

                isSubmittingRequest=false;

                document.getElementById("btnRequest").disabled=false;

            },2000);

        } else {

            alert(result.error);

        }

    })

    .catch(error=>{

        console.error(error);

        document.getElementById("overlay").style.display="none";

        alert(error);

        isSubmittingRequest=false;

        document.getElementById("btnRequest").disabled=false;

    });

};

reader.readAsDataURL(file);

});

function submitRealisasi() {

const petugasValid = [
    "Adji",
    "Agus",
    "Andika",
    "Aryo",
    "Budi",
    "Ivan",
    "Usep",
    "Yudi",
    "Zaenal"
];

const tanggalInput = document.getElementById("tanggalBunker");
const literInput = document.getElementById("realisasiLiter");
const petugasInput = document.getElementById("petugas");

if (!tanggalInput.reportValidity()) return;
if (!literInput.reportValidity()) return;
if (!petugasInput.reportValidity()) return;

if (!petugasValid.includes(petugasInput.value)) {

    petugasInput.setCustomValidity(
        "Please select a value from the list."
    );

    petugasInput.reportValidity();
    return;
}

petugasInput.setCustomValidity("");

const data = {

    jenis: "REALISASI",

    namaKapal: currentShip,

    tanggalBunker:
        document.getElementById(
            "tanggalBunker"
        ).value,

    realisasiLiter:
        document.getElementById(
            "realisasiLiter"
        ).value,

    petugas:
        document.getElementById(
            "petugas"
        ).value

};

fetch(WEB_APP_URL, {

    method: "POST",

    headers: {
        "Content-Type":
            "text/plain;charset=utf-8"
    },

    body: JSON.stringify(data)

})
.then(response => response.json())

.then(result => {

    if (!result.success) {

        alert("Gagal simpan realisasi");

        return;
    }

    loadStokTangki();

})

.catch(error => {

    console.error(error);

    alert(error);

    return;

});

document.getElementById(
    "alert-" + currentShip
).style.display = "none";

document.getElementById("overlay").style.display = "flex";
document.getElementById("loader").style.display = "block";
document.getElementById("checkmark").style.display = "none";
document.getElementById("successText").style.display = "none";

setTimeout(function() {

    document.getElementById("loader").style.display = "none";
    document.getElementById("checkmark").style.display = "block";
    document.getElementById("successText").style.display = "block";

    delete requestData[currentShip];

    document.getElementById("tanggalBunker").value = "";
    document.getElementById("realisasiLiter").value = "";
    document.getElementById("petugas").value = "";

    setTimeout(function() {

        document.getElementById("overlay").style.display = "none";
        closeForm();

    }, 2000);

}, 1500);
}

function submitTank(){

const tanggal =
    document.getElementById("tankTanggal").value;

const jumlah =
    document.getElementById("tankJumlah").value;

const petugas =
    document.getElementById("tankPetugas").value;

if(!tanggal || !jumlah || !petugas){

    alert("Lengkapi semua data");

    return;
}

document.getElementById("overlay").style.display="flex";

document.getElementById("loader").style.display="block";

document.getElementById("checkmark").style.display="none";

document.getElementById("successText").style.display="block";

document.getElementById("successText").innerHTML=
"Menyimpan Pengisian Tangki...";

fetch(WEB_APP_URL,{

    method:"POST",

    headers:{
        "Content-Type":"text/plain;charset=utf-8"
    },

    body:JSON.stringify({

        jenis:"PENGISIAN_TANGKI",

        tanggal:tanggal,

        jumlah:jumlah,

        petugas:petugas

    })

})

.then(res=>res.json())

.then(result=>{

    if(result.success){

        document.getElementById("loader").style.display="none";

        document.getElementById("checkmark").style.display="block";

        document.getElementById("successText").innerHTML=
        "Pengisian tangki berhasil disimpan";

        loadStokTangki();

        setTimeout(()=>{

            document.getElementById("overlay").style.display="none";

            document.getElementById("tankTanggal").value="";
            document.getElementById("tankJumlah").value="";
            document.getElementById("tankPetugas").value="";

            closeTankForm();

        },2000);

    }else{

        alert(result.error);

        document.getElementById("overlay").style.display="none";

    }

})

.catch(err=>{

    console.log(err);

    alert(err);

    document.getElementById("overlay").style.display="none";

});

}

function loadRequestStatus() {

fetch(WEB_APP_URL)

.then(response => response.json())

.then(data => {

    data.forEach(item => {

        const kapal = item.namaKapal;

        const alertElement =
            document.getElementById(
                "alert-" + kapal
            );

        if (alertElement) {

            alertElement.style.display = "block";

        }

        requestData[kapal] = item;

    });

})

.catch(error => console.error(error));

}

function loadStokTangki() {

fetch(WEB_APP_URL + "?action=stok")

.then(response => response.json())

.then(data => {

    stokTangki = Number(data.stok) || 0;

    drawGauge(stokTangki);

})

.catch(error => {

    console.log(error);

    drawGauge(0);

});

}

function drawGauge(liter){

const canvas=document.getElementById("fuelGauge");

const ctx=canvas.getContext("2d");

const max=5000;

const persen=liter/max;

ctx.clearRect(0,0,300,170);

ctx.lineWidth=20;

ctx.strokeStyle="#ddd";

ctx.beginPath();

ctx.arc(150,150,100,Math.PI,0);

ctx.stroke();

// ====================
// Jarum Speedometer
// ====================

const angle = Math.PI + (Math.PI * persen);

const x = 150 + 80 * Math.cos(angle);

const y = 150 + 80 * Math.sin(angle);

ctx.beginPath();

ctx.moveTo(150,150);

ctx.lineTo(x,y);

ctx.lineWidth = 5;

ctx.strokeStyle = "#ff0000";

ctx.stroke();

ctx.beginPath();

ctx.arc(150,150,8,0,2*Math.PI);

ctx.fillStyle="#333";

ctx.fill();

if(persen>0.6){

    ctx.strokeStyle="#28a745";

}else if(persen>0.3){

    ctx.strokeStyle="#ffc107";

}else{

    ctx.strokeStyle="#dc3545";

}

ctx.beginPath();

ctx.arc(
    150,
    150,
    100,
    Math.PI,
    Math.PI+(Math.PI*persen)
);

ctx.stroke();

ctx.fillStyle="#000";
ctx.font="18px Segoe UI";

ctx.fillText("0",25,155);

ctx.fillText("2500",135,30);

    ctx.fillText("5000",245,155);

    document.getElementById("stokLiter").innerHTML=
    liter+" L";

document.getElementById("persenTank").innerHTML=
Math.round(persen*100)+" %";
}

function resetMenu(){

    document
    .querySelectorAll(".menu-btn")
    .forEach(btn=>btn.classList.remove("active"));

    document
    .getElementById("btnDashboard")
    .classList.remove("active");

}

function formatRobDateKey(date){
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function formatRobDisplayDate(date){
    return date.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

function formatRobMonthLabel(date){
    return date.toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric"
    });
}

function startOfDay(date) {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    return copy;
}

function isSameRobDate(left, right) {
    return left.getFullYear() === right.getFullYear()
        && left.getMonth() === right.getMonth()
        && left.getDate() === right.getDate();
}

function getRobDateStatus(date) {
    const today = startOfDay(new Date());
    const compareDate = startOfDay(date);

    if (isSameRobDate(compareDate, today)) {
        return "today";
    }

    if (compareDate < today) {
        return "past";
    }

    return "future";
}

function isRobDateClickable(date) {
    return getRobDateStatus(date) !== "future";
}

function loadRobMasterData(){
    fetch(WEB_APP_URL + "?action=master_kapal")
        .then(response => response.text())
        .then(text => {
            try {
                const data = JSON.parse(text);
                if (Array.isArray(data) && data.length > 0) {
                    robMasterKapal = data;
                } else {
                    robMasterKapal = buildRobFallbackMaster();
                }
            } catch (error) {
                robMasterKapal = buildRobFallbackMaster();
            }
            renderRobShipList();
        })
        .catch(() => {
            robMasterKapal = buildRobFallbackMaster();
            renderRobShipList();
        });
}

function buildRobFallbackMaster(){
    return [];
}

function renderRobViews(){
    const calendarScreen = document.getElementById("robCalendarScreen");
    const detailScreen = document.getElementById("robDetailScreen");
    const shipScreen = document.getElementById("robShipScreen");
    const formScreen = document.getElementById("robFormScreen");

    if (!calendarScreen || !detailScreen || !shipScreen || !formScreen) return;

    calendarScreen.style.display = robCurrentStep === "calendar" ? "block" : "none";
    detailScreen.style.display = robCurrentStep === "detail" ? "block" : "none";
    shipScreen.style.display = robCurrentStep === "ship" ? "block" : "none";
    formScreen.style.display = robCurrentStep === "form" ? "block" : "none";

    if (robCurrentStep === "calendar") {
        renderRobCalendar();
    }

    if (robCurrentStep === "detail") {
        renderRobDetail();
    }

    if (robCurrentStep === "ship") {
        renderRobShipList();
    }

    if (robCurrentStep === "form") {
        prepareRobForm();
    }
}

function renderRobCalendar(){
    const title = document.getElementById("robMonthTitle");
    if (title) {
        title.textContent = formatRobMonthLabel(robCurrentMonth);
    }

    const grid = document.getElementById("robCalendarGrid");
    if (!grid) return;

    const year = robCurrentMonth.getFullYear();
    const month = robCurrentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const firstDayIndex = (firstDay.getDay() + 6) % 7;
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();
    const totalCells = Math.ceil((firstDayIndex + totalDays) / 7) * 7;

    grid.innerHTML = "";

    for (let index = 0; index < totalCells; index++) {
        const dayNumber = index - firstDayIndex + 1;
        const currentDate = new Date(year, month, dayNumber);
        const isCurrentMonth = currentDate.getMonth() === month;
        const dateStatus = isCurrentMonth ? getRobDateStatus(currentDate) : "muted";
        const isToday = dateStatus === "today";
        const isSelected = isCurrentMonth && isSameRobDate(currentDate, robSelectedDate);
        const isClickable = isCurrentMonth && isRobDateClickable(currentDate);
        const dateKey = formatRobDateKey(currentDate);
        const hasData = false;

        const cell = document.createElement("button");
        cell.type = "button";
        cell.className = `rob-day-cell ${isCurrentMonth ? "rob-day-current" : "rob-day-muted"} ${isSelected ? "rob-day-selected" : ""} ${isToday ? "rob-day-today" : ""} ${dateStatus === "past" ? "rob-day-past" : ""} ${dateStatus === "future" ? "rob-day-future" : ""}`;
        cell.innerHTML = `
            <span class="rob-day-number">${currentDate.getDate()}</span>
            ${hasData ? '<span class="rob-day-dot"></span>' : ""}
        `;

        if (isCurrentMonth && isClickable) {
            cell.addEventListener("click", function () {
                robSelectedDate = new Date(currentDate);
                robCurrentStep = "detail";
                renderRobViews();
            });
        } else {
            cell.disabled = true;
            cell.style.cursor = "not-allowed";
        }

        grid.appendChild(cell);
    }
}

function changeRobMonth(step){
    robCurrentMonth = new Date(robCurrentMonth.getFullYear(), robCurrentMonth.getMonth() + step, 1);
    renderRobCalendar();
}

function goToCurrentRobMonth(){
    robCurrentMonth = new Date();
    robSelectedDate = new Date();
    robCurrentStep = "calendar";
    renderRobViews();
}

function renderRobDetail() {

    const detailText =
        document.getElementById("robSelectedDateText");

    const body =
        document.getElementById("robTableBody");

    if (!detailText || !body) return;

    detailText.textContent =
        formatRobDisplayDate(robSelectedDate);

    const tanggal =
        formatRobDateKey(robSelectedDate);

    fetch(WEB_APP_URL + "?action=rob_harian&tanggal=" + tanggal)

        .then(res => res.json())

        .then(data => {

            if (!Array.isArray(data) || data.length === 0) {

                body.innerHTML =
                    '<tr><td colspan="7">Belum ada data.</td></tr>';

                return;

            }

            body.innerHTML = "";

            data.forEach((item, index) => {

                body.innerHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.namaKapal}</td>
                    <td>${item.jenisBbm}</td>
                    <td>${item.robOnBoard}</td>
                    <td>${item.robOutBoard}</td>
                    <td>${item.totalRob}</td>
                    <td>${item.pelapor}</td>
                </tr>
                `;

            });

        });

}

function loadRobStatus(){

    const tanggal = formatRobDateKey(robSelectedDate);

    fetch(WEB_APP_URL + "?action=cek_status_rob&tanggal=" + tanggal)

    .then(res => res.json())

    .then(data=>{

        robKapalSelesai = data;

        renderRobShipList();

    })

    .catch(err=>{

        console.log(err);

        robKapalSelesai = [];

        renderRobShipList();

    });

}

function renderRobShipList(){

    const shipGrid =
    document.getElementById("robShipGrid");

    if(!shipGrid) return;

    if(!robMasterKapal.length){

        shipGrid.innerHTML =
        '<div class="rob-empty-state">Belum ada data kapal.</div>';

        return;

    }

    shipGrid.innerHTML="";

    robMasterKapal.forEach((ship,index)=>{

        const sudahInput =
        robKapalSelesai.includes(ship.nama);

        shipGrid.innerHTML +=`

        <button

            class="rob-ship-btn"

            ${sudahInput ? "disabled" : ""}

            onclick="selectRobShip(${index})">

            <span class="rob-ship-name">

                ${ship.nama}

            </span>

            <span class="rob-ship-bbm">

                ${ship.jenisBbm}

            </span>

            ${
                sudahInput
                ?
                '<div style="color:red;font-size:12px;">Sudah Report</div>'
                :
                ""
            }

        </button>

        `;

    });

}

function selectRobShip(index){

    const kapal = robMasterKapal[index];

    if(!kapal) return;

    if(robKapalSelesai.includes(kapal.nama)){

        alert("Kapal ini sudah melakukan Daily ROB Report.");

        return;

    }

    robSelectedShip = kapal;

    robCurrentStep = "form";

    renderRobViews();

}

function openRobShipSelection(){

    robCurrentStep = "ship";

    renderRobViews();

    loadRobStatus();

}

function showRobCalendarFromStep(){
    robCurrentStep = "calendar";
    renderRobViews();
}

function prepareRobForm(){
    const dateLabel = document.getElementById("robFormDateLabel");
    const shipLabel = document.getElementById("robFormShipLabel");
    const bbmLabel = document.getElementById("robFormBbmLabel");
    const dateInput = document.getElementById("robEntryDate");
    const form = document.getElementById("robEntryForm");

    if (!dateLabel || !shipLabel || !bbmLabel || !dateInput || !form) return;

    dateLabel.textContent = formatRobDisplayDate(robSelectedDate);
    shipLabel.textContent = robSelectedShip ? robSelectedShip.nama : "-";
    bbmLabel.textContent = robSelectedShip ? robSelectedShip.jenisBbm : "-";
    dateInput.value = formatRobDateKey(robSelectedDate);

    form.reset();
    dateInput.value = formatRobDateKey(robSelectedDate);
    document.getElementById("robEntryTotal").value = "";
    updateRobFormRules();
}

function updateRobFormRules(){
    const isSolar = (robSelectedShip && String(robSelectedShip.jenisBbm).toLowerCase().includes("solar"));
    const outBoardInput = document.getElementById("robEntryOutBoard");
    const onBoardInput = document.getElementById("robEntryOnBoard");
    const totalInput = document.getElementById("robEntryTotal");

    if (!outBoardInput || !onBoardInput || !totalInput) return;

    if (isSolar) {
        outBoardInput.disabled = true;
        outBoardInput.value = "";
        outBoardInput.placeholder = "Tidak berlaku";
    } else {
        outBoardInput.disabled = false;
        outBoardInput.placeholder = "Masukkan nilai";
    }

    onBoardInput.oninput = updateRobTotal;
    outBoardInput.oninput = updateRobTotal;
    updateRobTotal();
}

function updateRobTotal(){
    const onBoardInput = document.getElementById("robEntryOnBoard");
    const outBoardInput = document.getElementById("robEntryOutBoard");
    const totalInput = document.getElementById("robEntryTotal");

    if (!onBoardInput || !outBoardInput || !totalInput) return;

    const onBoardValue = Number(onBoardInput.value || 0);
    const outBoardValue = outBoardInput.disabled ? 0 : Number(outBoardInput.value || 0);
    totalInput.value = onBoardValue + outBoardValue;
}

function closeRobModal(){
    showRobCalendarFromStep();
}

function submitRobEntry(event){
    console.log("submitRobEntry berjalan");
    event.preventDefault();

    const dateKey = document.getElementById("robEntryDate").value;
    const nama = robSelectedShip ? robSelectedShip.nama : "";
    const jenisBbm = robSelectedShip ? robSelectedShip.jenisBbm : "";
    const robOnBoard = document.getElementById("robEntryOnBoard").value;
    const robOutBoard = document.getElementById("robEntryOutBoard").value;
    const pelapor = document.getElementById("robEntryPelapor").value.trim();

    const isSolar = String(jenisBbm).toLowerCase().includes("solar");

    if (!nama || !jenisBbm || !pelapor) {
        alert("Mohon lengkapi semua kolom penting.");
        return;
    }

    const onBoardValue = Number(robOnBoard || 0);
    if (!Number.isFinite(onBoardValue) || onBoardValue < 0) {
        alert("ROB On Board harus berupa angka yang valid.");
        return;
    }

    if (!isSolar) {
        const outBoardValue = Number(robOutBoard || 0);
        if (!Number.isFinite(outBoardValue) || outBoardValue < 0) {
            alert("ROB Out Board harus berupa angka yang valid.");
            return;
        }
    }

    const entry = {
        nama,
        jenisBbm,
        robOnBoard: onBoardValue,
        robOutBoard: isSolar ? 0 : Number(robOutBoard || 0),
        pelapor,
        timestamp: new Date().toISOString()
    };

    const payload = {
        action: "save_rob_report",
        date: dateKey,
        shipName: nama,
        jenisBbm,
        robOnBoard: onBoardValue,
        robOutBoard: isSolar ? 0 : Number(robOutBoard || 0),
        totalRob: onBoardValue + (isSolar ? 0 : Number(robOutBoard || 0)),
        pelapor,
        timestamp: entry.timestamp
    };

    fetch(WEB_APP_URL, {
        method: "POST",
        headers: {
            "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(result => {

        if (!result.success) {
            alert(result.message);
            return;
        }

        // kembali ke daftar kapal
        robCurrentStep = "ship";

        // refresh status kapal
        loadRobStatus(formatRobDateKey(robSelectedDate));

        alert("Data ROB berhasil disimpan.");

    })
    .catch(error => {

        console.log(error);

        alert("Gagal menyimpan data.");

    });

}

function showRequestPage(){

    resetMenu();

    document
    .getElementById("btnRequestBunker")
    .classList.add("active");

    setTimeout(function(){

        document.getElementById("homePage").style.display="none";

        document.getElementById("shipPage").style.display="block";

    },250);

}

function showRobPage(){

    resetMenu();

    document
        .getElementById("btnDashboard")
        .classList.add("active");

    loadRobMasterData();
    robCurrentStep = "calendar";
    renderRobViews();

    setTimeout(function(){

        document.getElementById("homePage").style.display="none";
        document.getElementById("robPage").style.display="block";

    },250);

}

function backHome(){

    document.getElementById("shipPage").style.display = "none";
    document.getElementById("formPage").style.display = "none";
    document.getElementById("tankForm").style.display = "none";

    resetMenu();

    document.getElementById("homePage").style.display = "block";

}

function closeRobPage(){

    if (robCurrentStep !== "calendar") {
        robCurrentStep = "calendar";
        renderRobViews();
        return;
    }

    document.getElementById("robPage").style.display="none";

    resetMenu();

    document.getElementById("homePage").style.display="block";

}

function showDrumPage(){

    resetMenu();

    document
        .getElementById("btnDrum")
        .classList.add("active");

    setTimeout(function(){

        document.getElementById("homePage").style.display="none";
        document.getElementById("drumPage").style.display="block";

    },250);

}

function closeDrumPage(){

    document.getElementById("drumPage").style.display="none";

    resetMenu();

    document.getElementById("homePage").style.display="block";

}

function showPinjamPage(){

    resetMenu();

    document
        .getElementById("btnPinjam")
        .classList.add("active");

    setTimeout(function(){

        document.getElementById("homePage").style.display="none";
        document.getElementById("pinjamPage").style.display="block";

    },250);

}
function closePinjamPage(){

    document.getElementById("pinjamPage").style.display="none";

    resetMenu();

    document.getElementById("homePage").style.display="block";

}
function loadDrumData(){

    fetch(WEB_APP_URL + "?action=drum")

    .then(res => res.json())

    .then(data=>{
        drumData = data;

        renderDrumPage();
    })

    .catch(err=>console.log(err));

}

function loadPinjamData(){

    fetch(WEB_APP_URL + "?action=pinjam")

    .then(res => res.json())

    .then(data => {
        console.log("PINJAM DATA:", data);
        renderPinjamTable(data);

    })

    .catch(err => console.log(err));

}

function loadRiwayatData(){
    fetch(WEB_APP_URL + "?action=riwayat")
    .then(res => res.json())
    .then(data => {
        renderRiwayatTable(data);
    })
    .catch(err => console.error(err));
}

function renderRiwayatTable(data){
    const tbody = document.getElementById("riwayatTableBody");
    if(!tbody) return;
    tbody.innerHTML = "";

    if(!data || data.length == 0){
        tbody.innerHTML = `<tr><td colspan="6">Belum ada data</td></tr>`;
        return;
    }

    // Only include entries marked Selesai and sort by tanggalKembali (newest first).
    const finished = (data || []).filter(it => {
        const status = (it.status || it.Status || it.statusText || "").toString().trim().toLowerCase();
        return status === 'selesai' || status === 'finished' || status === 'done';
    });

    function parseDateValue(v){
        if(!v) return 0;
        // If ISO-like
        if(typeof v === 'string' && /\d{4}-\d{2}-\d{2}T/.test(v)){
            const t = Date.parse(v);
            return isNaN(t)?0:t;
        }
        // If format dd/MM/yyyy HH:mm:ss
        if(typeof v === 'string' && /^\d{2}\/\d{2}\/\d{4}/.test(v)){
            try{
                const parts = v.split(' ');
                const dateParts = parts[0].split('/');
                const timeParts = (parts[1]||'00:00:00').split(':');
                const day = Number(dateParts[0]);
                const month = Number(dateParts[1]) - 1;
                const year = Number(dateParts[2]);
                const hour = Number(timeParts[0]||0);
                const min = Number(timeParts[1]||0);
                const sec = Number(timeParts[2]||0);
                return new Date(year, month, day, hour, min, sec).getTime();
            }catch(e){
                return 0;
            }
        }
        // Fallback
        const d = new Date(v);
        return isNaN(d.getTime())?0:d.getTime();
    }

    const sorted = finished.sort((a,b)=>{
        const aVal = parseDateValue(a.tanggalKembali || a.TanggalKembali || a.tanggal_kembali || a.returnedAt);
        const bVal = parseDateValue(b.tanggalKembali || b.TanggalKembali || b.tanggal_kembali || b.returnedAt);
        return bVal - aVal;
    });

    sorted.forEach((item, idx) => {
        const tanggal = item.tanggal || item.Tanggal || "-";
        const peminjam = item.peminjam || item.nama || "-";
        const meminjamkan = item.meminjamkan || item.meminjamkan || item.departemen || "-";
        const jumlah = item.jumlah || item.Jumlah || "-";
        const tanggalKembali = item.tanggalKembali || item.TanggalKembali || item.tanggal_kembali || item.returnedAt || "";

        tbody.innerHTML += `
        <tr>
            <td>${idx + 1}</td>
            <td>${formatIndoDate(tanggal)}</td>
            <td>${peminjam}</td>
            <td>${meminjamkan}</td>
            <td>${jumlah}</td>
            <td>${tanggalKembali ? formatIndoDate(tanggalKembali) : "-"}</td>
        </tr>
        `;
    });
}

function getPinjamSortValue(item){
    const candidates = [
        item.row,
        item._row,
        item.index,
        item.id,
        item.no,
        item.No,
        item.timestamp,
        item.createdAt,
        item['Created At'],
        item['Timestamp']
    ];

    for(const value of candidates){
        if(value === undefined || value === null || value === "") continue;

        const numericValue = Number(value);
        if(!Number.isNaN(numericValue)) return numericValue;

        const parsedDate = Date.parse(String(value));
        if(!Number.isNaN(parsedDate)) return parsedDate;
    }

    return 0;
}

function formatIndoDate(value){
    if(!value) return "-";

    let date = value instanceof Date ? value : new Date(value);
    if(Number.isNaN(date.getTime())) return String(value);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes} WIB`;
}

function renderPinjamTable(data){

    const tbody = document.getElementById("pinjamTableBody");
    tbody.innerHTML = "";
    if(!data || data.length==0){
        tbody.innerHTML = `
        <tr>
            <td colspan="6">Belum ada peminjaman</td>
        </tr>
        `;
        return;
    }

    // Filter out entries that are already returned/finished
    const activeData = (data || []).filter(it => {
        const status = (it.status || it.Status || it.statusText || it.StatusText || "").toString().trim().toLowerCase();
        return status !== 'selesai' && status !== 'finished' && status !== 'done';
    });

    updatePinjamKPIs(activeData);

    if(activeData.length === 0){
        tbody.innerHTML = `
        <tr>
            <td colspan="6">Belum ada peminjaman aktif</td>
        </tr>
        `;
        return;
    }

    const sortedData = [...activeData].sort((a, b) => {
        const aValue = getPinjamSortValue(a);
        const bValue = getPinjamSortValue(b);

        if(aValue !== bValue){
            return aValue - bValue;
        }

        return 0;
    });

    sortedData.forEach((item, index) => {
        const tanggalRaw = item.tanggal || item['Tanggal'] || item.waktu || item['Waktu'] || item.tanggalKembali || item.B || "-";
        const tanggal = formatIndoDate(tanggalRaw);
        const peminjam = item.peminjam || item.nama || item.peminjamNama || item.C || item['Peminjam'] || "-";
        const meminjamkan = item.meminjamkan || item.departemen || item.kapal || item.D || item['Meminjamkan'] || "-";
        const jumlah = item.jumlah || item.qty || item.E || item['Jumlah'] || "-";
        const rowId = item.row || item._row || item.index || item.id || "";

        tbody.innerHTML += `
        <tr>
            <td>${index + 1}</td>
            <td>${tanggal}</td>
            <td>${peminjam}</td>
            <td>${meminjamkan}</td>
            <td>${jumlah}</td>
            <td>
                <button class="btn-simpan btn-kembali" onclick="returnPinjam('${rowId}')">Kembalikan</button>
            </td>
        </tr>
        `;
    });

}

function submitPinjam(){

    const tanggal = document.getElementById("pinjamTanggal").value;
    const peminjam = document.getElementById("pinjamPeminjam").value;
    const meminjamkan = document.getElementById("pinjamMeminjamkan").value;
    const jumlah = document.getElementById("pinjamJumlah").value;

    if(!tanggal || !peminjam || !meminjamkan || !jumlah){
        alert("Lengkapi catatan peminjaman terlebih dahulu.");
        return;
    }

    if(peminjam === meminjamkan){
        alert("Peminjam dan yang meminjamkan tidak boleh sama.");
        return;
    }

    fetch(WEB_APP_URL,{
        method:"POST",
        headers:{ "Content-Type":"text/plain;charset=utf-8" },
        body:JSON.stringify({
            jenis:"PINJAM_DRUM",
            tanggal: tanggal,
            peminjam: peminjam,
            meminjamkan: meminjamkan,
            jumlah: jumlah,
            status: 'Aktif',
            insertedTop: true // hint backend to insert at top/No 1
        })
    })
    .then(res=>res.json())
    .then(result=>{
        if(result.success){
            alert("Data berhasil disimpan.");

            document.getElementById("pinjamTanggal").value="";
            document.getElementById("pinjamPeminjam").value="";
            document.getElementById("pinjamMeminjamkan").value="";
            document.getElementById("pinjamJumlah").value="1";

            loadPinjamData();

        }else{
            alert(result.error || "Gagal menyimpan data.");
        }
    })
    .catch(err=>{
        console.log(err);
        alert(err);
    });

}

function returnPinjam(index){
    if(!confirm('Konfirmasi pengembalian?')) return;

    fetch(WEB_APP_URL,{
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ jenis: 'KEMBALIKAN_PINJAM', index: index })
    })
    .then(res=>res.json())
    .then(result=>{
        if(result.success){
            alert('Data berhasil dikembalikan.');
            loadPinjamData();
            loadRiwayatData();
        }else{
            alert(result.error || 'Gagal mengembalikan data.');
        }
    })
    .catch(err=>{
        console.error(err);
        alert(err);
    });
}

function removePinjamRow(btn){
    if(!confirm('Hapus entri ini?')) return;
    const tr = btn.closest('tr');
    if(tr) tr.remove();
}

function renderDrumPage(){

    const grid =
    document.getElementById("drumShipContainer");

    grid.innerHTML="";

    let totalKosong=0;
    let totalDrum=0;

    const rekomendasi=[];

    drumData.forEach(item=>{

        const kosong=Number(item.drumKosong);
        const total=Number(item.totalDrum);

        totalKosong+=kosong;
        totalDrum+=total;

        const rasio=kosong/total;

        let warna="green";
        let prioritas=1;

        if(rasio>=1){

            warna="red";
            prioritas=4;

        }else if(rasio>=0.75){

            warna="orange";
            prioritas=3;

        }else if(rasio>=0.5){

            warna="yellow";
            prioritas=2;

        }

        rekomendasi.push({

            nama:item.namaKapal,

            kosong:kosong,

            total:total,

            rasio:rasio,

            warna:warna,

            prioritas:prioritas

        });

        grid.innerHTML +=`

        <div class="drum-card ${warna}">

            <div class="drum-name">
                ${item.namaKapal}
            </div>

            <div
                class="drum-total"
                id="rasio-${item.namaKapal}">
                ${kosong} / ${total}
            </div>

            <div class="drum-control">

                <button
                class="drum-btn"
                onclick="ubahDrum('${item.namaKapal}',-1)">
                −
                </button>

                <div
                    class="drum-value"
                    id="jumlah-${item.namaKapal}">
                    ${kosong}
                </div>

                <button
                class="drum-btn"
                onclick="ubahDrum('${item.namaKapal}',1)">
                +
                </button>

            </div>

        </div>

        `;

    });

    updateKPI(totalKosong,totalDrum);

    updateRekomendasi(rekomendasi);

}

function updateKPI(totalKosong,totalDrum){

    document.getElementById("totalDrumKosong").innerHTML =
    totalKosong;

    let persen=0;

    if(totalDrum>0){

        persen=Math.round(
            totalKosong/totalDrum*100
        );

    }

    document.getElementById("persentaseDrum").innerHTML =
    persen + "%";

}

function updateRekomendasi(data){

    data.sort((a,b)=>{

        if(b.prioritas!=a.prioritas)
            return b.prioritas-a.prioritas;

        if(b.rasio!=a.rasio)
            return b.rasio-a.rasio;

        return b.kosong-a.kosong;

    });

    const box =
    document.getElementById("recommendList");

    box.innerHTML="";

    data.forEach(item=>{

        let status="";

        if(item.warna=="red"){

            status="SEGERA DIISI";

        }else if(item.warna=="orange"){

            status="PRIORITAS TINGGI";

        }else if(item.warna=="yellow"){

            status="PERLU DIPANTAU";

        }else{

            status="AMAN";

        }

        box.innerHTML +=`

        <div class="recommend-item ${item.warna}">

            <div>

                <b>${item.nama}</b><br>

                ${item.kosong}/${item.total} Drum

            </div>

            <div>

                ${status}

            </div>

        </div>

        `;

    });

}

function ubahDrum(nama, nilai){

    const kapal =
    drumData.find(x=>x.namaKapal===nama);

    if(!kapal) return;

    kapal.drumKosong += nilai;

    if(kapal.drumKosong<0)
        kapal.drumKosong=0;

    if(kapal.drumKosong>kapal.totalDrum)
        kapal.drumKosong=kapal.totalDrum;

    updateDrum(kapal);

}

function updateDrum(kapal){

    renderDrumPage();

    fetch(WEB_APP_URL,{

        method:"POST",

        headers:{
            "Content-Type":"text/plain;charset=utf-8"
        },

        body:JSON.stringify({

            jenis:"UPDATE_DRUM",

            namaKapal:kapal.namaKapal,

            drumKosong:kapal.drumKosong

        })

    })

    .catch(err=>console.log(err));

}

function showPinjamDrumPage(){

    hideAllPage();

    document
    .getElementById("pinjamDrumPage")
    .classList.remove("hidden");

}

function showRiwayatPage(){

    hideAllPage();

    document
    .getElementById("riwayatPinjamPage")
    .classList.remove("hidden");

}

function backToPinjam(){

    hideAllPage();

    document
    .getElementById("pinjamDrumPage")
    .classList.remove("hidden");

}

function showRiwayatPage(){
    document.getElementById("pinjamPage").style.display = "none";
    document.getElementById("riwayatPage").style.display = "block";
}

function closeRiwayatPage(){
    document.getElementById("riwayatPage").style.display = "none";
    document.getElementById("pinjamPage").style.display = "block";
}

function updatePinjamKPIs(activeData){
    try{
        const peminjamCount = (activeData || []).length;
        let totalDrum = 0;
        (activeData || []).forEach(it => {
            const j = Number(it.jumlah || it.qty || it.E || it['Jumlah'] || it.Jumlah || 0);
            if(!Number.isNaN(j)) totalDrum += j;
        });

        const elCount = document.getElementById('kpiPeminjamAktif');
        const elTotal = document.getElementById('kpiJumlahDrumPinjam');
        if(elCount) elCount.innerText = peminjamCount;
        if(elTotal) elTotal.innerText = totalDrum;
    }catch(e){
        console.error('updatePinjamKPIs error', e);
    }
}