var slider = document.getElementById("myRange");
var output = document.getElementById("demo");
output.innerHTML = slider.value + '°C';
status(slider.value, 'temp');

slider.oninput = function () {
    output.innerHTML = this.value + '°C';
    status(this.value, 'temp');
}

var slider2 = document.getElementById("myRange2");
var output2 = document.getElementById("demo2");
output2.innerHTML = slider2.value + ' PPM';
status(slider2.value, 'tds');

slider2.oninput = function () {
    output2.innerHTML = this.value + ' PPM';
    status(this.value, 'tds');
}

var slider3 = document.getElementById("myRange3");
var output3 = document.getElementById("demo3");
output3.innerHTML = slider3.value + '%';
status(slider3.value, 'wl');

slider3.oninput = function () {
    output3.innerHTML = this.value + '%';
    status(this.value, 'wl');
}

function status(value, type) {
    if (type == 'temp') {
        var text = document.getElementById("Temperature");
        if (value <= 20) {
            text.innerHTML = "Suhu Terlalu Dingin Untuk Tanaman Hidroponik";
        } else if (value > 20 && value <= 40) {
            text.innerHTML = "Suhu Ini Sudah Cocok Untuk Tanaman Hidroponik";
        } else {
            text.innerHTML = "Suhu Ini Terlalu Panas Untuk Tanaman Hidroponik";
        }
    }
    else if(type=='tds'){
        var text = document.getElementById("Tds");
        if (value <= 1200) {
            text.innerHTML = "Pupuk Cair Hampir Habis Tolong Segera Isi Ulang Pupuk";
        } else if (value > 1200 && value <= 3700) {
            text.innerHTML = "Pupuk Pada Tanaman Hidroponik Berada Di Status Aman";
        } else {
            text.innerHTML = "Pupuk Masih Banyak";
        }
    }
    else{
        var text = document.getElementById("wl");
        if (value <= 35) {
            text.innerHTML = "Segera Isi Tangki Air Tanaman Hidroponik Kamu";
        } else if (value > 35 && value <= 80) {
            text.innerHTML = "Tangki Air Tanaman Hidroponik Berada Di Status Aman";
        } else {
            text.innerHTML = "Tangki Air Tanaman Hidroponik Kamu Masih Penuh";
        } 
    }
}