// ==========================================
// CONFIGURAÇÕES
// ==========================================

// Coordenadas aproximadas do centro de Ponta Grossa - PR

const centroPG = [
    -25.0945,
    -50.1633
];


// ==========================================
// MAPA PRINCIPAL
// ==========================================

const map = L.map("map").setView(
    centroPG,
    13
);

L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
    }
).addTo(map);


// ==========================================
// MAPA DO CADASTRO
// ==========================================

const mapCadastro =
    L.map("mapCadastro").setView(
        centroPG,
        13
    );

L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
    }
).addTo(mapCadastro);


let marcadorCadastro = null;


// ==========================================
// ELEMENTOS
// ==========================================

const categoria =
    document.getElementById("categoria");

const tipoProblema =
    document.getElementById("tipoProblema");

const latitude =
    document.getElementById("latitude");

const longitude =
    document.getElementById("longitude");

const descricao =
    document.getElementById("descricao");

const bairro =
    document.getElementById("bairro");

const foto =
    document.getElementById("foto");

const previewFoto =
    document.getElementById("previewFoto");

const previewContainer =
    document.getElementById("previewContainer");

const form =
    document.getElementById("formOcorrencia");

const lista =
    document.getElementById("listaOcorrencias");


// ==========================================
// OPÇÕES DE PROBLEMA
// ==========================================

const problemas = {

    "Iluminação Pública": [
        "Poste apagado",
        "Poste piscando",
        "Luminária quebrada",
        "Poste danificado",
        "Fiação exposta"
    ],

    "Asfalto": [
        "Buraco no asfalto",
        "Asfalto afundado",
        "Pavimento quebrado",
        "Água acumulada",
        "Falta de sinalização"
    ],

    "Calçada": [
        "Calçada quebrada",
        "Buraco na calçada",
        "Falta de acessibilidade",
        "Obstáculo na passagem",
        "Ausência de calçada"
    ]

};


// ==========================================
// TROCAR CATEGORIA
// ==========================================

categoria.addEventListener(
    "change",
    function () {

        tipoProblema.innerHTML =
            '<option value="">Selecione o problema</option>';

        const listaProblemas =
            problemas[this.value];

        if (!listaProblemas) {
            return;
        }

        listaProblemas.forEach(
            problema => {

                const option =
                    document.createElement("option");

                option.value =
                    problema;

                option.textContent =
                    problema;

                tipoProblema.appendChild(
                    option
                );

            }
        );

    }
);


// ==========================================
// MARCAR PONTO NO MAPA
// ==========================================

mapCadastro.on(
    "click",
    function (evento) {

        const lat =
            evento.latlng.lat;

        const lng =
            evento.latlng.lng;

        definirLocalizacao(
            lat,
            lng
        );

    }
);


function definirLocalizacao(
    lat,
    lng
) {

    latitude.value =
        lat.toFixed(6);

    longitude.value =
        lng.toFixed(6);

    if (marcadorCadastro) {

        marcadorCadastro
            .setLatLng([
                lat,
                lng
            ]);

    } else {

        marcadorCadastro =
            L.marker([
                lat,
                lng
            ])
            .addTo(
                mapCadastro
            );

    }

    mapCadastro.panTo([
        lat,
        lng
    ]);

}


// ==========================================
// GEOLOCALIZAÇÃO
// ==========================================

document
    .getElementById("btnLocalizacao")
    .addEventListener(
        "click",
        function () {

            if (!navigator.geolocation) {

                alert(
                    "Seu navegador não possui suporte à localização."
                );

                return;

            }

            this.textContent =
                "Buscando localização...";

            navigator.geolocation
                .getCurrentPosition(

                    position => {

                        const lat =
                            position.coords.latitude;

                        const lng =
                            position.coords.longitude;

                        definirLocalizacao(
                            lat,
                            lng
                        );

                        mapCadastro.setView(
                            [
                                lat,
                                lng
                            ],
                            17
                        );

                        this.textContent =
                            "📍 Localização encontrada";

                    },

                    () => {

                        alert(
                            "Não foi possível obter sua localização."
                        );

                        this.textContent =
                            "📍 Usar minha localização";

                    }

                );

        }
    );


// ==========================================
// PRÉ-VISUALIZAÇÃO FOTO
// ==========================================

let fotoBase64 = "";

foto.addEventListener(
    "change",
    function () {

        const arquivo =
            this.files[0];

        if (!arquivo) {

            fotoBase64 = "";

            previewContainer.style.display =
                "none";

            return;

        }

        const reader =
            new FileReader();

        reader.onload =
            function (evento) {

                fotoBase64 =
                    evento.target.result;

                previewFoto.src =
                    fotoBase64;

                previewContainer
                    .style
                    .display =
                    "block";

            };

        reader.readAsDataURL(
            arquivo
        );

    }
);


// ==========================================
// CARREGAR OCORRÊNCIAS
// ==========================================

let ocorrencias =
    JSON.parse(
        localStorage.getItem(
            "ocorrenciasPG"
        )
    ) || [];


let marcadores = [];


// ==========================================
// CADASTRAR OCORRÊNCIA
// ==========================================

form.addEventListener(
    "submit",
    function (evento) {

        evento.preventDefault();


        if (
            !latitude.value ||
            !longitude.value
        ) {

            alert(
                "Selecione a localização do problema no mapa."
            );

            return;

        }


        const novaOcorrencia = {

            id: Date.now(),

            categoria:
                categoria.value,

            tipo:
                tipoProblema.value,

            descricao:
                descricao.value.trim(),

            bairro:
                bairro.value.trim(),

            latitude:
                parseFloat(
                    latitude.value
                ),

            longitude:
                parseFloat(
                    longitude.value
                ),

            foto:
                fotoBase64,

            status:
                "Registrado",

            data:
                new Date()
                    .toLocaleDateString(
                        "pt-BR"
                    )

        };


        ocorrencias.unshift(
            novaOcorrencia
        );


        salvarOcorrencias();


        form.reset();

        fotoBase64 = "";

        previewContainer
            .style
            .display =
            "none";


        if (marcadorCadastro) {

            mapCadastro.removeLayer(
                marcadorCadastro
            );

            marcadorCadastro =
                null;

        }


        latitude.value =
            "";

        longitude.value =
            "";


        exibirOcorrencias();

        atualizarMapa();

        atualizarEstatisticas();

        mostrarToast();


        document
            .getElementById(
                "ocorrencias"
            )
            .scrollIntoView({
                behavior:
                    "smooth"
            });

    }
);


// ==========================================
// LOCAL STORAGE
// ==========================================

function salvarOcorrencias() {

    localStorage.setItem(
        "ocorrenciasPG",
        JSON.stringify(
            ocorrencias
        )
    );

}


// ==========================================
// EXIBIR LISTA
// ==========================================

function exibirOcorrencias(
    filtro = "todos"
) {

    lista.innerHTML =
        "";


    let dados =
        ocorrencias;


    if (
        filtro !== "todos"
    ) {

        dados =
            ocorrencias.filter(
                item =>
                    item.categoria ===
                    filtro
            );

    }


    if (
        dados.length === 0
    ) {

        lista.innerHTML = `

            <div class="sem-ocorrencias">

                <h3>
                    Nenhuma ocorrência encontrada
                </h3>

                <p>
                    Seja o primeiro a registrar
                    um problema nesta categoria.
                </p>

            </div>

        `;

        return;

    }


    dados.forEach(
        item => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "ocorrencia-card";


            let imagem = `
                <div class="ocorrencia-img">
                    📍
                </div>
            `;


            if (
                item.foto
            ) {

                imagem = `

                    <div class="ocorrencia-img">

                        <img
                            src="${item.foto}"
                            alt="Foto da ocorrência"
                        >

                    </div>

                `;

            }


            card.innerHTML = `

                ${imagem}

                <div class="ocorrencia-content">

                    <span class="categoria">
                        ${item.categoria}
                    </span>

                    <h3>
                        ${item.tipo}
                    </h3>

                    <p>
                        ${item.descricao}
                    </p>

                    ${
                        item.bairro
                        ?
                        `
                        <p>
                            📍 ${item.bairro}
                        </p>
                        `
                        :
                        ""
                    }

                    <p>
                        📅 ${item.data}
                    </p>

                    <span class="status">
                        ${item.status}
                    </span>

                </div>

            `;


            lista.appendChild(
                card
            );

        }
    );

}


// ==========================================
// MARCADORES DO MAPA
// ==========================================

function atualizarMapa(
    filtro = "todos"
) {

    marcadores.forEach(
        marcador =>
            map.removeLayer(
                marcador
            )
    );

    marcadores = [];


    let dados =
        ocorrencias;


    if (
        filtro !== "todos"
    ) {

        dados =
            ocorrencias.filter(
                item =>
                    item.categoria ===
                    filtro
            );

    }


    dados.forEach(
        item => {

            let icone = "📍";


            if (
                item.categoria ===
                "Iluminação Pública"
            ) {

                icone =
                    "💡";

            }


            if (
                item.categoria ===
                "Asfalto"
            ) {

                icone =
                    "🚧";

            }


            if (
                item.categoria ===
                "Calçada"
            ) {

                icone =
                    "🚶";

            }


            const marcador =
                L.marker(
                    [
                        item.latitude,
                        item.longitude
                    ]
                )
                .addTo(
                    map
                );


            marcador.bindPopup(`

                <strong>
                    ${icone}
                    ${item.tipo}
                </strong>

                <br>

                <small>
                    ${item.categoria}
                </small>

                <br><br>

                ${item.descricao}

                ${
                    item.bairro
                    ?
                    `<br><br>📍 ${item.bairro}`
                    :
                    ""
                }

                <br><br>

                <strong>
                    Status:
                </strong>

                ${item.status}

            `);


            marcadores.push(
                marcador
            );

        }
    );

}


// ==========================================
// ESTATÍSTICAS
// ==========================================

function atualizarEstatisticas() {

    document
        .getElementById(
            "totalOcorrencias"
        )
        .textContent =
        ocorrencias.length;


    document
        .getElementById(
            "totalIluminacao"
        )
        .textContent =
        ocorrencias.filter(
            item =>
                item.categoria ===
                "Iluminação Pública"
        ).length;


    document
        .getElementById(
            "totalAsfalto"
        )
        .textContent =
        ocorrencias.filter(
            item =>
                item.categoria ===
                "Asfalto"
        ).length;


    document
        .getElementById(
            "totalCalcada"
        )
        .textContent =
        ocorrencias.filter(
            item =>
                item.categoria ===
                "Calçada"
        ).length;

}


// ==========================================
// FILTROS
// ==========================================

document
    .querySelectorAll(
        ".filtro"
    )
    .forEach(
        botao => {

            botao.addEventListener(
                "click",
                function () {

                    document
                        .querySelectorAll(
                            ".filtro"
                        )
                        .forEach(
                            btn =>
                                btn.classList
                                    .remove(
                                        "ativo"
                                    )
                        );


                    this.classList.add(
                        "ativo"
                    );


                    const filtro =
                        this.dataset.filtro;


                    exibirOcorrencias(
                        filtro
                    );

                    atualizarMapa(
                        filtro
                    );

                }
            );

        }
    );


// ==========================================
// MENSAGEM DE SUCESSO
// ==========================================

function mostrarToast() {

    const toast =
        document.getElementById(
            "toast"
        );


    toast.classList.add(
        "show"
    );


    setTimeout(
        () => {

            toast.classList
                .remove(
                    "show"
                );

        },
        3000
    );

}


// ==========================================
// INICIALIZAÇÃO
// ==========================================

exibirOcorrencias();

atualizarMapa();

atualizarEstatisticas();

// ==========================================
// MENU MOBILE
// ==========================================

const menuToggle =
    document.getElementById("menuToggle");

const menuNav =
    document.getElementById("menuNav");


menuToggle.addEventListener(
    "click",
    function () {

        menuNav.classList.toggle("ativo");

        menuToggle.classList.toggle("ativo");

        const aberto =
            menuNav.classList.contains("ativo");

        menuToggle.setAttribute(
            "aria-expanded",
            aberto
        );

    }
);


// Fecha o menu após clicar em uma opção

document
    .querySelectorAll("#menuNav a")
    .forEach(link => {

        link.addEventListener(
            "click",
            function () {

                menuNav.classList.remove("ativo");

                menuToggle.classList.remove("ativo");

                menuToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }
        );

    });