async function fetchData() {
  const response = await fetch("https://raw.githubusercontent.com/Jakarta-9/Dataset-NYC-Property-Sales/main/NYC-dataset-Team-9.json");
  const data = await response.json();
  console.log(data);
}
fetchData();



// linechart
async function fetchLineChartData() {
  const response = await fetch("https://raw.githubusercontent.com/Jakarta-9/Dataset-NYC-Property-Sales/main/NYC-dataset-Team-9.json");
  const data = await response.json();

  // Ekstrak bulan, tahun, dan harga penjualan dari data
  const salesData = {};
  const startDate = new Date("2016-09-01");
  const endDate = new Date("2017-08-31");

  data.forEach(entry => {
    const saleDate = new Date(entry['SALE_DATE']);
    if (saleDate >= startDate && saleDate <= endDate) {
      const month = saleDate.toLocaleString('default', { month: 'long' });
      const year = saleDate.getFullYear();
      const borough = entry['BOROUGH_NAME'];
      const salePrice = parseFloat(entry['SALE_PRICE']); // Konversi harga penjualan ke tipe float

      const label = `${month}, ${year}`;

      if (!salesData[borough]) {
        salesData[borough] = {};
      }

      if (!salesData[borough][label]) {
        salesData[borough][label] = 0;
      }

      salesData[borough][label] += salePrice; // Menambahkan harga penjualan ke label yang sesuai
    }
  });

  // Menyiapkan data untuk chart
  const labelsSet = new Set();
  const datasets = [];

  Object.keys(salesData).forEach(borough => {
    Object.keys(salesData[borough]).forEach(label => {
      labelsSet.add(label);
    });
  });

  const labels = Array.from(labelsSet).sort((a, b) => {
    const [monthA, yearA] = a.split(', ');
    const [monthB, yearB] = b.split(', ');
    return new Date(`${monthA} 1, ${yearA}`) - new Date(`${monthB} 1, ${yearB}`);
  });

  Object.keys(salesData).forEach(borough => {
    const data = labels.map(label => salesData[borough][label] || 0);

    datasets.push({
      label: borough,
      data: data,
      fill: false,
      borderColor: `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`,
      tension: 0.1
    });
  });

  const dataForChart = {
    labels: labels,
    datasets: datasets
  };

  const config = {
    type: 'line',
    data: dataForChart,
    options: {
      scales: {
        x: {
          title: {
            display: true,
            text: 'Month, Year'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Sale Price'
          }
        }
      }
    }
  };

  var myChart = new Chart(
    document.getElementById('myChart'),
    config
  );
}
// barchart
async function fetchBarChartData() {
  const response = await fetch("https://raw.githubusercontent.com/Jakarta-9/Dataset-NYC-Property-Sales/main/NYC-dataset-Team-9.json");
  const data = await response.json();
  return data;
}

async function renderBarChart() {
  const data = await fetchBarChartData();

  const boroughTotals = {}; // Menyimpan total SALE_PRICE untuk setiap BOROUGH

  // Menghitung total SALE_PRICE untuk setiap BOROUGH
  data.forEach(entry => {
    const borough = entry['BOROUGH_NAME'] || entry['BOROUGH'];
    const salePrice = parseFloat(entry['SALE_PRICE']);

    if (!boroughTotals[borough]) {
      boroughTotals[borough] = 0;
    }

    boroughTotals[borough] += salePrice;
  });

  // Mengambil array kunci dari objek boroughTotals (yaitu nama-nama BOROUGH)
  const boroughs = Object.keys(boroughTotals);

  const barData = {
    labels: boroughs,
    datasets: [{
      label: 'Total Sale Price',
      data: boroughs.map(borough => boroughTotals[borough] || 0),
      backgroundColor: boroughs.map(() => `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.2)`),
      borderColor: boroughs.map(() => `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`),
      borderWidth: 1
    }]
  };

  const config = {
    type: 'bar',
    data: barData,
    options: {
      scales: {
        x: {
          title: {
            display: true,
            text: 'BOROUGH'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Sale Price',
            beginAtZero: true,
            // Format label sumbu Y untuk menampilkan angka dengan satuan "b" (miliar)
            callback: function (value, index, values) {
              return value / 1000000000 + 'b';
            }
          }
        }
      }
    }
  };

  new Chart(
    document.getElementById('barChart'),
    config
  );
}

document.addEventListener('DOMContentLoaded', () => {
  fetchLineChartData();
  renderBarChart();
});



// barchart2
async function fetchNYCPropertyData() {
  try {
      const response = await fetch("https://raw.githubusercontent.com/Jakarta-9/Dataset-NYC-Property-Sales/main/NYC-dataset-Team-9.json");
      const data = await response.json();
      return data;
  } catch (error) {
      console.error("Error fetching data:", error);
      return null;
  }
}

document.addEventListener('DOMContentLoaded', async function () {
  const data = await fetchNYCPropertyData();
  if (data) {
      const filteredData = filterData(data);
      const barData = prepareBarData(filteredData);
      const lineData = prepareLineData(filteredData);

      renderChart(barData, lineData);
  }
});

function filterData(data) {
  // Filter data untuk rentang waktu yang diinginkan (September 2016 hingga Agustus 2017)
  return data.filter(entry => {
      const date = new Date(entry.SALE_DATE);
      return date >= new Date('2016-09-01') && date <= new Date('2017-08-31');
  });
}

function prepareBarData(data) {
  const barLabels = ['September 2016', 'October 2016', 'November 2016', 'December 2016', 'January 2017', 'February 2017', 'March 2017', 'April 2017', 'May 2017', 'June 2017', 'July 2017', 'August 2017'];
  const residentialUnits = Array(12).fill(0);
  const commercialUnits = Array(12).fill(0);

  data.forEach(entry => {
      const monthIndex = new Date(entry.SALE_DATE).getMonth();
      residentialUnits[monthIndex] += entry.RESIDENTIAL_UNITS;
      commercialUnits[monthIndex] += entry.COMMERCIAL_UNITS;
  });

  return {
      labels: barLabels,
      datasets: [{
          label: 'Total RESIDENTIAL_UNITS',
          data: residentialUnits,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 1
      },
      {
          label: 'Total COMMERCIAL_UNITS',
          data: commercialUnits,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 1
      }]
  };
}

function prepareLineData(data) {
  const lineData = [];
  data.forEach(entry => {
      const saleDate = new Date(entry.SALE_DATE);
      const monthYear = saleDate.toLocaleString('en-us', { month: 'long', year: 'numeric' });
      lineData.push({
          y: monthYear,
          x: entry.RESIDENTIAL_UNITS + entry.COMMERCIAL_UNITS
      });
  });
  return lineData;
}

function renderChart(barData, lineData) {
  const ctx = document.getElementById('barChart2').getContext('2d');
  new Chart(ctx, {
      type: 'bar',
      data: barData,
      options: {
          scales: {
              y: {
                  beginAtZero: true
              }
          }
      }
  });

  const lineCtx = document.getElementById('lineChart').getContext('2d');
  new Chart(lineCtx, {
      type: 'scatter',
      data: {
          datasets: [{
              label: 'Month/Year vs Total Units',
              data: lineData,
              backgroundColor: 'rgba(255, 159, 64, 0.2)',
              borderColor: 'rgba(255, 159, 64, 1)',
              borderWidth: 1
          }]
      },
      options: {
          scales: {
              x: {
                  beginAtZero: true,
                  title: {
                      display: true,
                      text: 'Total Units'
                  }
              },
              y: {
                  type: 'category',
                  position: 'left',
                  title: {
                      display: true,
                      text: 'Month/Year'
                  }
              }
          }
      }
  });
}


// doughnutChart1
async function fetchDataForResidentialUnits() {
  try {
      const response = await fetch("https://raw.githubusercontent.com/Jakarta-9/Dataset-NYC-Property-Sales/main/NYC-dataset-Team-9.json");
      const data = await response.json();
      return data;
  } catch (error) {
      console.error("Error fetching data:", error);
      return null;
  }
}

document.addEventListener('DOMContentLoaded', async function () {
  const data = await fetchDataForResidentialUnits();
  if (data) {
      const boroughData = extractBoroughDataForResidentialUnits(data);
      renderDoughnutChartForResidentialUnits(boroughData);
  }
});

function extractBoroughDataForResidentialUnits(data) {
  // Filter data untuk rentang waktu yang diinginkan (September 2016 hingga Agustus 2017)
  const filteredData = data.filter(entry => {
      const date = new Date(entry.SALE_DATE);
      return date >= new Date('2016-09-01') && date <= new Date('2017-08-31');
  });

  // Menghitung total RESIDENTIAL_UNITS untuk setiap borough
  const boroughTotals = {};
  filteredData.forEach(entry => {
      const borough = entry.BOROUGH_NAME;
      if (boroughTotals[borough]) {
          boroughTotals[borough] += entry.RESIDENTIAL_UNITS;
      } else {
          boroughTotals[borough] = entry.RESIDENTIAL_UNITS;
      }
  });

  // Menyusun data untuk doughnut chart
  const labels = Object.keys(boroughTotals);
  const totalResidentialUnits = Object.values(boroughTotals);
  return { labels, totalResidentialUnits };
}

function renderDoughnutChartForResidentialUnits(boroughData) {
  const data = {
      labels: boroughData.labels,
      datasets: [{
          label: 'Total RESIDENTIAL_UNITS',
          data: boroughData.totalResidentialUnits,
          backgroundColor: [
              'rgb(255, 99, 132)',
              'rgb(54, 162, 235)',
              'rgb(255, 205, 86)',
              'rgb(75, 192, 192)',
              'rgb(153, 102, 255)'
          ],
          hoverOffset: 4
      }]
  };

  const config = {
      type: 'doughnut',
      data: data,
      options: {
          plugins: {
              legend: {
                  position: 'right', // Memindahkan legenda ke sebelah kanan chart
              },
          },
      },
  };

  var myChart = new Chart(
      document.getElementById('doughnutChart1'),
      config
  );
}


// doughnutChart2
async function fetchDataForCommercialUnits() {
  try {
      const response = await fetch("https://raw.githubusercontent.com/Jakarta-9/Dataset-NYC-Property-Sales/main/NYC-dataset-Team-9.json");
      const data = await response.json();
      return data;
  } catch (error) {
      console.error("Error fetching data:", error);
      return null;
  }
}

document.addEventListener('DOMContentLoaded', async function () {
  const data = await fetchDataForCommercialUnits();
  if (data) {
      const boroughData = extractBoroughDataForCommercialUnits(data);
      renderDoughnutChartForCommercialUnits(boroughData);
  }
});

function extractBoroughDataForCommercialUnits(data) {
  // Filter data untuk rentang waktu yang diinginkan (September 2016 hingga Agustus 2017)
  const filteredData = data.filter(entry => {
      const date = new Date(entry.SALE_DATE);
      return date >= new Date('2016-09-01') && date <= new Date('2017-08-31');
  });

  // Menghitung total COMMERCIAL_UNITS untuk setiap borough
  const boroughTotals = {};
  filteredData.forEach(entry => {
      const borough = entry.BOROUGH_NAME;
      if (boroughTotals[borough]) {
          boroughTotals[borough] += entry.COMMERCIAL_UNITS;
      } else {
          boroughTotals[borough] = entry.COMMERCIAL_UNITS;
      }
  });

  // Menyusun data untuk doughnut chart
  const labels = Object.keys(boroughTotals);
  const totalCommercialUnits = Object.values(boroughTotals);
  return { labels, totalCommercialUnits };
}

function renderDoughnutChartForCommercialUnits(boroughData) {
  const data = {
      labels: boroughData.labels,
      datasets: [{
          label: 'Total COMMERCIAL_UNITS',
          data: boroughData.totalCommercialUnits,
          backgroundColor: [
              'rgb(255, 99, 132)',
              'rgb(54, 162, 235)',
              'rgb(255, 205, 86)',
              'rgb(75, 192, 192)',
              'rgb(153, 102, 255)'
          ],
          hoverOffset: 4
      }]
  };

  const config = {
      type: 'doughnut',
      data: data,
      options: {
          plugins: {
              legend: {
                  position: 'right', // Memindahkan legenda ke sebelah kanan chart
              },
          },
      },
  };

  var myChart = new Chart(
      document.getElementById('doughnutChart2'),
      config
  );
}



// data tabel
document.addEventListener("DOMContentLoaded", async function () {
  const itemsPerPage = 10; // Jumlah item per halaman
  let currentPage = 1; // Halaman yang sedang ditampilkan
  let totalPages = 0; // Jumlah total halaman
  let data = null; // Variabel untuk menyimpan data tabel

  // Fungsi untuk mengambil data dari URL
  async function fetchTableData() {
      try {
          const response = await fetch("https://raw.githubusercontent.com/Jakarta-9/Dataset-NYC-Property-Sales/main/NYC-dataset-Team-9.json");
          const jsonData = await response.json();
          console.log("Data from URL:", jsonData); // Tambahkan log untuk memeriksa data
          return jsonData;
      } catch (error) {
          console.error("Error fetching data:", error);
          return null;
      }
  }

  // Fungsi untuk membuat tabel dan menambahkan data
  function createTable(data) {
      const tableContainer = document.getElementById('table-container');
      const dataTable = document.getElementById('data-table');
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = Math.min(startIndex + itemsPerPage, data.length); // Batasi maksimal endIndex agar tidak melebihi panjang data
      const currentData = data.slice(startIndex, endIndex);

      // Kosongkan tabel sebelum menambahkan data baru
      dataTable.innerHTML = '';

      // Membuat header tabel
      const headerRow = document.createElement('tr');
      const headers = ['Borough', 'Neighborhood', 'Building Class Category', 'Year Built']; // Kolom yang diinginkan

      headers.forEach(function (headerText) {
          const th = document.createElement('th');
          th.textContent = headerText;
          headerRow.appendChild(th);
      });

      dataTable.appendChild(headerRow);

      // Membuat body tabel
      currentData.forEach(function (item) {
          const row = document.createElement('tr');

          // Kolom yang diambil dari data
          const columns = ['BOROUGH_NAME', 'NEIGHBORHOOD', 'BUILDING_CLASS_CATEGORY', 'YEAR_BUILT'];

          columns.forEach(function (columnKey) {
              const cell = document.createElement('td');
              cell.textContent = item[columnKey];
              row.appendChild(cell);
          });

          dataTable.appendChild(row);
      });

      // Menambahkan tabel ke dalam container
      tableContainer.appendChild(dataTable);
  }

  // Menghitung total halaman
  function calculateTotalPages() {
      totalPages = Math.ceil(data.length / itemsPerPage);
  }

  // Memuat data dari URL dan membuat tabel saat halaman dimuat
  data = await fetchTableData();
  if (data) {
      calculateTotalPages();
      createTable(data);
      createPaginationButtons();
  }

  // Event listener untuk tombol halaman sebelumnya
  document.getElementById('prev-page').addEventListener('click', function () {
      if (currentPage > 1) {
          currentPage--;
          createTable(data);
          updateActivePageButton();
      }
  });

  // Event listener untuk tombol halaman selanjutnya
  document.getElementById('next-page').addEventListener('click', function () {
      if (currentPage < totalPages) {
          currentPage++;
          createTable(data);
          updateActivePageButton();
      }
  });

  // Membuat tombol halaman
  function createPaginationButtons() {
      const pageNumbers = document.getElementById('page-numbers');
      pageNumbers.innerHTML = ''; // Kosongkan daftar tombol sebelum menambahkan tombol baru

      // Tombol "previous"
      const prevButton = document.createElement('li');
      prevButton.classList.add('page-item');
      const prevLink = document.createElement('a');
      prevLink.classList.add('page-link');
      prevLink.href = '#';
      prevLink.innerHTML = '&laquo;'; // Tanda panah kiri
      prevButton.appendChild(prevLink);
      pageNumbers.appendChild(prevButton);

      // Tombol angka halaman
      const startPage = Math.max(1, currentPage - 4); // Tentukan angka awal halaman yang akan ditampilkan
      const endPage = Math.min(totalPages, startPage + 9); // Tentukan angka akhir halaman yang akan ditampilkan
      for (let i = startPage; i <= endPage; i++) {
          const li = document.createElement('li');
          li.classList.add('page-item');
          if (i === currentPage) {
              li.classList.add('active');
          }
          const a = document.createElement('a');
          a.classList.add('page-link');
          a.href = '#';
          a.textContent = i;
          a.addEventListener('click', function () {
              currentPage = i;
              createTable(data);
              updateActivePageButton();
          });
          li.appendChild(a);
          pageNumbers.appendChild(li);
      }

      // Tombol "next"
      const nextButton = document.createElement('li');
      nextButton.classList.add('page-item');
      const nextLink = document.createElement('a');
      nextLink.classList.add('page-link');
      nextLink.href = '#';
      nextLink.innerHTML = '&raquo;'; // Tanda panah kanan
      nextButton.appendChild(nextLink);
      pageNumbers.appendChild(nextButton);
  }

  // Fungsi untuk memperbarui tombol halaman yang aktif
  function updateActivePageButton() {
      const pageButtons = document.querySelectorAll('#page-numbers .page-item');
      pageButtons.forEach((button, index) => {
          if (index === currentPage) {
              button.classList.add('active');
          } else {
              button.classList.remove('active');
          }
      });
  }
});






