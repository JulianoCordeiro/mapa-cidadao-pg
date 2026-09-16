// =========================================================
// MAPA CIDADÃO PG
// SCRIPT PRINCIPAL
// =========================================================


// =========================================================
// 1. CONFIGURAÇÕES GERAIS
// =========================================================

const CENTRO_PONTA_GROSSA = [-25.0945, -50.1633];

const ZOOM_INICIAL = 13;

const TAMANHO_MAXIMO_FOTO = 5 * 1024 * 1024;

const TIPOS_IMAGEM_PERMITIDOS = [
    "image/jpeg",
    "image/png",
    "image/webp"
];


// =========================================================
// 2. VARIÁVEIS
// =========================================================

let ocorrencias = [];

let marcadorCadastro = null;

let marcadoresMapa = [];

let filtroCategoriaAtual = "Todos";

let filtroStatusAtual = "Todos";

let mapa = null;

let mapaCadastro = null;

let timeoutToast = null;


// =========================================================
// 3. ELEMENTOS DO HTML
// =========================================================

const formOcorrencia =
    document.getElementById("formOcorrencia");

const categoria =
    document.getElementById("categoria");

const tipoProblema =
    document.getElementById("tipoProblema");

const bairro =
    document.getElementById("bairro");

const descricao =
    document.getElementById("descricao");

const contadorDescricao =
    document.getElementById("contadorDescricao");

const foto =
    document.getElementById("foto");

const previewFoto =
    document.getElementById("previewFoto");

const previewContainer =
    document.getElementById("previewContainer");

const removerFoto =
    document.getElementById("removerFoto");

const latitude =
    document.getElementById("latitude");

const longitude =
    document.getElementById("longitude");

const btnLocalizacao =
    document.getElementById("btnLocalizacao");

const btnCadastrar =
    document.getElementById("btnCadastrar");

const listaOcorrencias =
    document.getElementById("listaOcorrencias");

const carregandoOcorrencias =
    document.getElementById("carregandoOcorrencias");

const filtroStatus =
    document.getElementById("filtroStatus");

const toast =
    document.getElementById("toast");

const menuToggle =
    document.getElementById("menuToggle");

const menuNav =
    document.getElementById("menuNav");


// =========================================================
// 4. TIPOS DE PROBLEMAS
// =========================================================

const problemasPorCategoria = {

    "Iluminação Pública": [
        "Poste apagado",
        "Poste piscando",
        "Poste danificado",
        "Fiação exposta",
        "Luminária quebrada"
    ],

    "Asfalto": [
        "Buraco no asfalto",
        "Asfalto afundado",
        "Pavimento quebrado",
        "Falta de sinalização",
        "Água acumulada"
    ],

    "Calçadas": [
        "Calçada quebrada",
        "Buraco na calçada",
        "Falta de acessibilidade",
        "Obstáculo",
        "Ausência de calçada"
    ]

};


// =========================================================
// 5. FUNÇÃO DE SEGURANÇA PARA TEXTO
// =========================================================

function escaparHTML(valor) {

    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// =========================================================
// 6. MENSAGENS / TOAST
// =========================================================

function mostrarToast(
    mensagem,
    tipo = "sucesso"
) {

    if (!toast) {
        return;
    }

    if (timeoutToast) {
        clearTimeout(timeoutToast);
    }

    toast.textContent = mensagem;

    toast.className =
        `toast ativo ${tipo}`;

    timeoutToast = setTimeout(
        function () {

            toast.classList.remove(
                "ativo"
            );

        },
        4000
    );
}


// =========================================================
// 7. MAPA PRINCIPAL
// =========================================================

function iniciarMapaPrincipal() {

    const elementoMapa =
        document.getElementById("map");

    if (!elementoMapa) {
        return;
    }

    mapa = L.map("map").setView(
        CENTRO_PONTA_GROSSA,
        ZOOM_INICIAL
    );

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {

            maxZoom: 19,

            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

        }
    ).addTo(mapa);
}


// =========================================================
// 8. MAPA DE CADASTRO
// =========================================================

function iniciarMapaCadastro() {

    const elementoMapaCadastro =
        document.getElementById(
            "mapCadastro"
        );

    if (!elementoMapaCadastro) {
        return;
    }

    mapaCadastro =
        L.map("mapCadastro").setView(
            CENTRO_PONTA_GROSSA,
            ZOOM_INICIAL
        );

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {

            maxZoom: 19,

            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

        }
    ).addTo(mapaCadastro);


    // O usuário pode clicar no mapa
    // para escolher a localização.

    mapaCadastro.on(
        "click",
        function (evento) {

            definirLocalizacao(
                evento.latlng.lat,
                evento.latlng.lng,
                true
            );

        }
    );
}


// =========================================================
// 9. DEFINIR LOCALIZAÇÃO
// =========================================================

function definirLocalizacao(
    lat,
    lng,
    centralizar = false
) {

    if (
        !Number.isFinite(Number(lat)) ||
        !Number.isFinite(Number(lng))
    ) {

        mostrarToast(
            "Localização inválida.",
            "erro"
        );

        return;
    }


    const latNumero =
        Number(lat);

    const lngNumero =
        Number(lng);


    latitude.value =
        latNumero.toFixed(7);

    longitude.value =
        lngNumero.toFixed(7);


    if (!mapaCadastro) {
        return;
    }


    if (marcadorCadastro) {

        marcadorCadastro.setLatLng([
            latNumero,
            lngNumero
        ]);

    } else {

        marcadorCadastro =
            L.marker([
                latNumero,
                lngNumero
            ])
            .addTo(mapaCadastro);

    }


    if (centralizar) {

        mapaCadastro.setView(
            [
                latNumero,
                lngNumero
            ],
            17
        );

    }
}


// =========================================================
// 10. GEOLOCALIZAÇÃO
// =========================================================

function usarMinhaLocalizacao() {

    if (!navigator.geolocation) {

        mostrarToast(
            "Seu navegador não possui suporte à geolocalização.",
            "erro"
        );

        return;
    }


    btnLocalizacao.disabled = true;

    btnLocalizacao.textContent =
        "Obtendo localização...";


    navigator.geolocation.getCurrentPosition(

        function (posicao) {

            definirLocalizacao(
                posicao.coords.latitude,
                posicao.coords.longitude,
                true
            );


            mostrarToast(
                "Localização encontrada.",
                "sucesso"
            );


            btnLocalizacao.disabled =
                false;

            btnLocalizacao.textContent =
                "📍 Usar minha localização";

        },


        function (erro) {

            console.error(
                "Erro de geolocalização:",
                erro
            );


            let mensagem =
                "Não foi possível obter sua localização. Selecione o ponto manualmente no mapa.";


            if (erro.code === 1) {

                mensagem =
                    "A permissão de localização foi negada. Você pode selecionar o ponto manualmente no mapa.";

            }


            mostrarToast(
                mensagem,
                "aviso"
            );


            btnLocalizacao.disabled =
                false;

            btnLocalizacao.textContent =
                "📍 Usar minha localização";

        },


        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 30000
        }

    );
}


// =========================================================
// 11. CATEGORIA / TIPO DO PROBLEMA
// =========================================================

function atualizarTiposProblema() {

    tipoProblema.innerHTML =
        '<option value="">Selecione o tipo do problema</option>';


    const categoriaSelecionada =
        categoria.value;


    const problemas =
        problemasPorCategoria[
            categoriaSelecionada
        ];


    if (!problemas) {
        return;
    }


    problemas.forEach(
        function (problema) {

            const option =
                document.createElement(
                    "option"
                );


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


// =========================================================
// 12. CONTADOR DA DESCRIÇÃO
// =========================================================

function atualizarContadorDescricao() {

    if (
        !descricao ||
        !contadorDescricao
    ) {
        return;
    }


    contadorDescricao.textContent =
        descricao.value.length;
}


// =========================================================
// 13. VALIDAR FOTO
// =========================================================

function validarFoto(arquivo) {

    if (!arquivo) {

        return {
            valido: false,
            mensagem:
                "Selecione uma fotografia."
        };

    }


    if (
        !TIPOS_IMAGEM_PERMITIDOS.includes(
            arquivo.type
        )
    ) {

        return {

            valido: false,

            mensagem:
                "A fotografia deve estar em formato JPG, PNG ou WEBP."

        };

    }


    if (
        arquivo.size >
        TAMANHO_MAXIMO_FOTO
    ) {

        return {

            valido: false,

            mensagem:
                "A fotografia deve possuir no máximo 5 MB."

        };

    }


    return {
        valido: true
    };
}


// =========================================================
// 14. PREVIEW DA FOTO
// =========================================================

function mostrarPreviewFoto() {

    const arquivo =
        foto.files[0];


    if (!arquivo) {

        limparPreviewFoto();

        return;
    }


    const validacao =
        validarFoto(arquivo);


    if (!validacao.valido) {

        mostrarToast(
            validacao.mensagem,
            "erro"
        );


        foto.value = "";

        limparPreviewFoto();

        return;
    }


    const urlTemporaria =
        URL.createObjectURL(
            arquivo
        );


    previewFoto.onload =
        function () {

            URL.revokeObjectURL(
                urlTemporaria
            );

        };


    previewFoto.src =
        urlTemporaria;


    previewContainer.style.display =
        "block";
}


// =========================================================
// 15. REMOVER PREVIEW
// =========================================================

function limparPreviewFoto() {

    if (previewFoto) {

        previewFoto.removeAttribute(
            "src"
        );

    }


    if (previewContainer) {

        previewContainer.style.display =
            "none";

    }
}


function removerFotoSelecionada() {

    foto.value = "";

    limparPreviewFoto();
}


// =========================================================
// 16. GERAR NOME SEGURO PARA A FOTO
// =========================================================

function gerarNomeArquivo(arquivo) {

    let extensao =
        arquivo.name
            .split(".")
            .pop()
            .toLowerCase();


    // Segurança adicional para extensão

    const extensoesPermitidas = [
        "jpg",
        "jpeg",
        "png",
        "webp"
    ];


    if (
        !extensoesPermitidas.includes(
            extensao
        )
    ) {

        if (
            arquivo.type ===
            "image/png"
        ) {

            extensao = "png";

        } else if (
            arquivo.type ===
            "image/webp"
        ) {

            extensao = "webp";

        } else {

            extensao = "jpg";

        }

    }


    let identificador;


    if (
        typeof crypto !==
            "undefined" &&

        typeof crypto.randomUUID ===
            "function"
    ) {

        identificador =
            crypto.randomUUID();

    } else {

        identificador =
            `${Date.now()}-${Math.random()
                .toString(36)
                .slice(2)}`;

    }


    return (
        `${Date.now()}-${identificador}.${extensao}`
    );
}


// =========================================================
// 17. ENVIAR FOTO PARA SUPABASE STORAGE
// =========================================================

async function enviarFoto(arquivo) {

    const validacao =
        validarFoto(arquivo);


    if (!validacao.valido) {

        throw new Error(
            validacao.mensagem
        );

    }


    const nomeArquivo =
        gerarNomeArquivo(
            arquivo
        );


    const caminhoArquivo =
        `public/${nomeArquivo}`;


    const {
        data,
        error
    } =
        await supabaseClient
            .storage
            .from("ocorrencias")
            .upload(
                caminhoArquivo,
                arquivo,
                {

                    cacheControl:
                        "3600",

                    upsert:
                        false,

                    contentType:
                        arquivo.type

                }
            );


    if (error) {

        console.error(
            "Erro no upload:",
            error
        );


        throw new Error(
            "Não foi possível enviar a fotografia."
        );

    }


    const resultadoURL =
        supabaseClient
            .storage
            .from("ocorrencias")
            .getPublicUrl(
                data.path
            );


    if (
        !resultadoURL.data ||
        !resultadoURL.data.publicUrl
    ) {

        throw new Error(
            "Não foi possível gerar o endereço da fotografia."
        );

    }


    return {

        url:
            resultadoURL.data.publicUrl,

        path:
            data.path

    };
}


// =========================================================
// 18. REMOVER FOTO DO STORAGE EM CASO DE ERRO
// =========================================================

async function removerFotoStorage(
    caminho
) {

    if (!caminho) {
        return;
    }


    try {

        const {
            error
        } =
            await supabaseClient
                .storage
                .from("ocorrencias")
                .remove([
                    caminho
                ]);


        if (error) {

            console.warn(
                "Não foi possível remover a fotografia após o erro:",
                error
            );

        }

    } catch (erro) {

        console.warn(
            "Erro ao tentar limpar fotografia:",
            erro
        );

    }
}


// =========================================================
// 19. VALIDAR FORMULÁRIO
// =========================================================

function validarFormulario() {

    if (!categoria.value) {

        return "Selecione uma categoria.";

    }


    if (!tipoProblema.value) {

        return "Selecione o tipo do problema.";

    }


    if (!descricao.value.trim()) {

        return "Informe uma descrição.";

    }


    if (
        descricao.value.trim().length >
        250
    ) {

        return "A descrição deve possuir no máximo 250 caracteres.";

    }


    const arquivo =
        foto.files[0];


    const validacaoFoto =
        validarFoto(
            arquivo
        );


    if (!validacaoFoto.valido) {

        return validacaoFoto.mensagem;

    }


    if (
        !latitude.value ||
        !longitude.value
    ) {

        return "Selecione a localização da ocorrência no mapa.";

    }


    const lat =
        Number(latitude.value);

    const lng =
        Number(longitude.value);


    if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lng)
    ) {

        return "As coordenadas informadas são inválidas.";

    }


    if (
        lat < -90 ||
        lat > 90 ||
        lng < -180 ||
        lng > 180
    ) {

        return "As coordenadas estão fora do intervalo permitido.";

    }


    return null;
}


// =========================================================
// 20. CADASTRAR OCORRÊNCIA
// =========================================================

async function cadastrarOcorrencia(
    evento
) {

    evento.preventDefault();


    const erroValidacao =
        validarFormulario();


    if (erroValidacao) {

        mostrarToast(
            erroValidacao,
            "erro"
        );

        return;
    }


    const arquivo =
        foto.files[0];


    let fotoEnviada =
        null;


    try {

        btnCadastrar.disabled =
            true;

        btnCadastrar.textContent =
            "Enviando fotografia...";


        // -------------------------------------------------
        // PRIMEIRO:
        // Enviar fotografia
        // -------------------------------------------------

        fotoEnviada =
            await enviarFoto(
                arquivo
            );


        btnCadastrar.textContent =
            "Salvando ocorrência...";


        // -------------------------------------------------
        // SEGUNDO:
        // Montar objeto
        // -------------------------------------------------

        const novaOcorrencia = {

            categoria:
                categoria.value,

            tipo_problema:
                tipoProblema.value,

            descricao:
                descricao.value
                    .trim(),

            bairro:
                bairro.value
                    .trim() || null,

            latitude:
                Number(
                    latitude.value
                ),

            longitude:
                Number(
                    longitude.value
                ),

            foto_url:
                fotoEnviada.url,

            foto_path:
                fotoEnviada.path,

            status:
                "Registrado"

        };


        // -------------------------------------------------
        // TERCEIRO:
        // Salvar no PostgreSQL
        // -------------------------------------------------

        const {
            error
        } =
            await supabaseClient
                .from("ocorrencias")
                .insert(
                    novaOcorrencia
                );


        if (error) {

            console.error(
                "Erro ao cadastrar ocorrência:",
                error
            );


            // Tenta remover a foto que acabou
            // de ser enviada, para evitar
            // arquivos sem ocorrência.

            await removerFotoStorage(
                fotoEnviada.path
            );


            throw new Error(
                "Não foi possível salvar a ocorrência no banco de dados."
            );

        }


        // -------------------------------------------------
        // SUCESSO
        // -------------------------------------------------

        mostrarToast(
            "Ocorrência registrada com sucesso!",
            "sucesso"
        );


        limparFormulario();


        await carregarOcorrencias();


        // Vai até a lista das ocorrências.

        const secaoOcorrencias =
            document.getElementById(
                "ocorrencias"
            );


        if (secaoOcorrencias) {

            secaoOcorrencias.scrollIntoView({
                behavior: "smooth"
            });

        }


    } catch (erro) {

        console.error(
            "Erro no cadastro:",
            erro
        );


        mostrarToast(
            erro.message ||
                "Ocorreu um erro ao registrar a ocorrência.",
            "erro"
        );


    } finally {

        btnCadastrar.disabled =
            false;

        btnCadastrar.textContent =
            "Registrar ocorrência";

    }
}


// =========================================================
// 21. LIMPAR FORMULÁRIO
// =========================================================

function limparFormulario() {

    formOcorrencia.reset();


    tipoProblema.innerHTML =
        '<option value="">Selecione uma categoria primeiro</option>';


    latitude.value = "";

    longitude.value = "";


    atualizarContadorDescricao();


    limparPreviewFoto();


    if (
        marcadorCadastro &&
        mapaCadastro
    ) {

        mapaCadastro.removeLayer(
            marcadorCadastro
        );

        marcadorCadastro = null;

    }


    if (mapaCadastro) {

        mapaCadastro.setView(
            CENTRO_PONTA_GROSSA,
            ZOOM_INICIAL
        );

    }
}


// =========================================================
// 22. CARREGAR OCORRÊNCIAS DO SUPABASE
// =========================================================

async function carregarOcorrencias() {

    if (carregandoOcorrencias) {

        carregandoOcorrencias.style.display =
            "block";

        carregandoOcorrencias.textContent =
            "Carregando ocorrências...";

    }


    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("ocorrencias")
                .select("*")
                .order(
                    "data_cadastro",
                    {
                        ascending: false
                    }
                );


        if (error) {

            console.error(
                "Erro ao carregar ocorrências:",
                error
            );


            throw new Error(
                "Não foi possível carregar as ocorrências."
            );

        }


        ocorrencias =
            Array.isArray(data)
                ? data
                : [];


        atualizarEstatisticas();

        aplicarFiltros();


    } catch (erro) {

        console.error(
            erro
        );


        if (listaOcorrencias) {

            listaOcorrencias.innerHTML = `

                <div class="sem-ocorrencias">

                    <span>
                        ⚠️
                    </span>

                    <strong>
                        Não foi possível carregar as ocorrências.
                    </strong>

                    <p>
                        Verifique a conexão e tente novamente.
                    </p>

                </div>

            `;

        }


        mostrarToast(
            "Erro ao carregar as ocorrências.",
            "erro"
        );


    } finally {

        if (carregandoOcorrencias) {

            carregandoOcorrencias.style.display =
                "none";

        }

    }
}


// =========================================================
// 23. FILTRAR OCORRÊNCIAS
// =========================================================

function aplicarFiltros() {

    let resultado =
        [...ocorrencias];


    // Categoria

    if (
        filtroCategoriaAtual !==
        "Todos"
    ) {

        resultado =
            resultado.filter(
                function (ocorrencia) {

                    return (
                        ocorrencia.categoria ===
                        filtroCategoriaAtual
                    );

                }
            );

    }


    // Status

    if (
        filtroStatusAtual !==
        "Todos"
    ) {

        resultado =
            resultado.filter(
                function (ocorrencia) {

                    return (
                        ocorrencia.status ===
                        filtroStatusAtual
                    );

                }
            );

    }


    exibirOcorrencias(
        resultado
    );


    atualizarMarcadoresMapa(
        resultado
    );
}


// =========================================================
// 24. ÍCONE DO STATUS
// =========================================================

function iconeStatus(status) {

    switch (status) {

        case "Em análise":
            return "🔵";

        case "Em manutenção":
            return "🟠";

        case "Resolvido":
            return "🟢";

        case "Registrado":
        default:
            return "🟡";

    }
}


// =========================================================
// 25. CLASSE CSS DO STATUS
// =========================================================

function classeStatus(status) {

    switch (status) {

        case "Em análise":
            return "status-analise";

        case "Em manutenção":
            return "status-manutencao";

        case "Resolvido":
            return "status-resolvido";

        case "Registrado":
        default:
            return "status-registrado";

    }
}


// =========================================================
// 26. FORMATAR DATA
// =========================================================

function formatarData(dataISO) {

    if (!dataISO) {

        return "Data não informada";

    }


    const data =
        new Date(
            dataISO
        );


    if (
        Number.isNaN(
            data.getTime()
        )
    ) {

        return "Data não informada";

    }


    return new Intl.DateTimeFormat(
        "pt-BR",
        {

            day: "2-digit",
            month: "2-digit",
            year: "numeric",

            hour: "2-digit",
            minute: "2-digit"

        }
    ).format(data);
}


// =========================================================
// 27. EXIBIR OCORRÊNCIAS
// =========================================================

function exibirOcorrencias(lista) {

    if (!listaOcorrencias) {
        return;
    }


    listaOcorrencias.innerHTML = "";


    if (!lista.length) {

        listaOcorrencias.innerHTML = `

            <div class="sem-ocorrencias">

                <span>
                    📍
                </span>

                <strong>
                    Nenhuma ocorrência encontrada.
                </strong>

                <p>
                    Não existem registros para os filtros selecionados.
                </p>

            </div>

        `;

        return;
    }


    lista.forEach(
        function (ocorrencia) {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "ocorrencia-card";


            const imagemHTML =
                ocorrencia.foto_url
                    ? `

                        <img
                            class="ocorrencia-img"
                            src="${escaparHTML(
                                ocorrencia.foto_url
                            )}"
                            alt="Fotografia da ocorrência: ${escaparHTML(
                                ocorrencia.tipo_problema
                            )}"
                            loading="lazy"
                        >

                    `
                    : "";


            const bairroHTML =
                ocorrencia.bairro
                    ? `

                        <p>
                            📍
                            ${escaparHTML(
                                ocorrencia.bairro
                            )}
                        </p>

                    `
                    : "";


            card.innerHTML = `

                ${imagemHTML}


                <div class="ocorrencia-conteudo">

                    <small>
                        ${escaparHTML(
                            ocorrencia.categoria
                        )}
                    </small>


                    <h3>
                        ${escaparHTML(
                            ocorrencia.tipo_problema
                        )}
                    </h3>


                    <p>
                        ${escaparHTML(
                            ocorrencia.descricao
                        )}
                    </p>


                    ${bairroHTML}


                    <p class="ocorrencia-data">

                        Registrado em

                        ${escaparHTML(
                            formatarData(
                                ocorrencia.data_cadastro
                            )
                        )}

                    </p>


                    <span
                        class="
                            status
                            ${classeStatus(
                                ocorrencia.status
                            )}
                        "
                    >

                        ${iconeStatus(
                            ocorrencia.status
                        )}

                        ${escaparHTML(
                            ocorrencia.status ||
                            "Registrado"
                        )}

                    </span>

                </div>

            `;


            listaOcorrencias.appendChild(
                card
            );

        }
    );
}


// =========================================================
// 28. ATUALIZAR MARCADORES DO MAPA
// =========================================================

function atualizarMarcadoresMapa(
    lista
) {

    if (!mapa) {
        return;
    }


    // Remover marcadores antigos

    marcadoresMapa.forEach(
        function (marcador) {

            mapa.removeLayer(
                marcador
            );

        }
    );


    marcadoresMapa = [];


    // Criar marcadores novos

    lista.forEach(
        function (ocorrencia) {

            const lat =
                Number(
                    ocorrencia.latitude
                );

            const lng =
                Number(
                    ocorrencia.longitude
                );


            if (
                !Number.isFinite(lat) ||
                !Number.isFinite(lng)
            ) {

                return;

            }


            const marcador =
                L.marker([
                    lat,
                    lng
                ])
                .addTo(mapa);


            const popup =
                document.createElement(
                    "div"
                );


            popup.className =
                "popup-ocorrencia";


            const imagemPopup =
                ocorrencia.foto_url
                    ? `

                        <img
                            src="${escaparHTML(
                                ocorrencia.foto_url
                            )}"
                            alt="Fotografia da ocorrência"
                        >

                    `
                    : "";


            popup.innerHTML = `

                <strong>
                    ${escaparHTML(
                        ocorrencia.tipo_problema
                    )}
                </strong>

                <br>

                <small>
                    ${escaparHTML(
                        ocorrencia.categoria
                    )}
                </small>


                ${imagemPopup}


                ${
                    ocorrencia.bairro
                        ? `

                            <div>
                                📍
                                ${escaparHTML(
                                    ocorrencia.bairro
                                )}
                            </div>

                        `
                        : ""
                }


                <div class="popup-status">

                    ${iconeStatus(
                        ocorrencia.status
                    )}

                    ${escaparHTML(
                        ocorrencia.status ||
                        "Registrado"
                    )}

                </div>

            `;


            marcador.bindPopup(
                popup
            );


            marcadoresMapa.push(
                marcador
            );

        }
    );
}


// =========================================================
// 29. ESTATÍSTICAS
// =========================================================

function atualizarEstatisticas() {

    const total =
        ocorrencias.length;


    const totalIluminacao =
        ocorrencias.filter(
            function (item) {

                return (
                    item.categoria ===
                    "Iluminação Pública"
                );

            }
        ).length;


    const totalAsfalto =
        ocorrencias.filter(
            function (item) {

                return (
                    item.categoria ===
                    "Asfalto"
                );

            }
        ).length;


    const totalCalcadas =
        ocorrencias.filter(
            function (item) {

                return (
                    item.categoria ===
                    "Calçadas"
                );

            }
        ).length;


    const elementoTotal =
        document.getElementById(
            "totalOcorrencias"
        );


    const elementoIluminacao =
        document.getElementById(
            "totalIluminacao"
        );


    const elementoAsfalto =
        document.getElementById(
            "totalAsfalto"
        );


    const elementoCalcadas =
        document.getElementById(
            "totalCalcadas"
        );


    if (elementoTotal) {

        elementoTotal.textContent =
            total;

    }


    if (elementoIluminacao) {

        elementoIluminacao.textContent =
            totalIluminacao;

    }


    if (elementoAsfalto) {

        elementoAsfalto.textContent =
            totalAsfalto;

    }


    if (elementoCalcadas) {

        elementoCalcadas.textContent =
            totalCalcadas;

    }
}


// =========================================================
// 30. FILTROS DE CATEGORIA
// =========================================================

function configurarFiltrosCategoria() {

    const botoesFiltro =
        document.querySelectorAll(
            ".filtro[data-filtro]"
        );


    botoesFiltro.forEach(
        function (botao) {

            botao.addEventListener(
                "click",
                function () {

                    filtroCategoriaAtual =
                        botao.dataset.filtro;


                    botoesFiltro.forEach(
                        function (item) {

                            item.classList.remove(
                                "ativo"
                            );

                        }
                    );


                    botao.classList.add(
                        "ativo"
                    );


                    aplicarFiltros();

                }
            );

        }
    );
}


// =========================================================
// 31. FILTRO DE STATUS
// =========================================================

function configurarFiltroStatus() {

    if (!filtroStatus) {
        return;
    }


    filtroStatus.addEventListener(
        "change",
        function () {

            filtroStatusAtual =
                filtroStatus.value;


            aplicarFiltros();

        }
    );
}


// =========================================================
// 32. MENU MOBILE
// =========================================================

function configurarMenuMobile() {

    if (
        !menuToggle ||
        !menuNav
    ) {

        return;
    }


    menuToggle.addEventListener(
        "click",
        function () {

            menuNav.classList.toggle(
                "ativo"
            );


            menuToggle.classList.toggle(
                "ativo"
            );


            const aberto =
                menuNav.classList.contains(
                    "ativo"
                );


            menuToggle.setAttribute(
                "aria-expanded",
                String(aberto)
            );


            menuToggle.setAttribute(
                "aria-label",
                aberto
                    ? "Fechar menu"
                    : "Abrir menu"
            );

        }
    );


    document
        .querySelectorAll(
            "#menuNav a"
        )
        .forEach(
            function (link) {

                link.addEventListener(
                    "click",
                    function () {

                        menuNav.classList.remove(
                            "ativo"
                        );


                        menuToggle.classList.remove(
                            "ativo"
                        );


                        menuToggle.setAttribute(
                            "aria-expanded",
                            "false"
                        );


                        menuToggle.setAttribute(
                            "aria-label",
                            "Abrir menu"
                        );

                    }
                );

            }
        );


    // Fecha menu se a tela voltar
    // para tamanho desktop.

    window.addEventListener(
        "resize",
        function () {

            if (
                window.innerWidth >
                768
            ) {

                menuNav.classList.remove(
                    "ativo"
                );


                menuToggle.classList.remove(
                    "ativo"
                );


                menuToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }

        }
    );
}


// =========================================================
// 33. CONFIGURAR EVENTOS DO FORMULÁRIO
// =========================================================

function configurarFormulario() {

    if (
        categoria &&
        tipoProblema
    ) {

        categoria.addEventListener(
            "change",
            atualizarTiposProblema
        );

    }


    if (
        descricao &&
        contadorDescricao
    ) {

        descricao.addEventListener(
            "input",
            atualizarContadorDescricao
        );

    }


    if (foto) {

        foto.addEventListener(
            "change",
            mostrarPreviewFoto
        );

    }


    if (removerFoto) {

        removerFoto.addEventListener(
            "click",
            removerFotoSelecionada
        );

    }


    if (btnLocalizacao) {

        btnLocalizacao.addEventListener(
            "click",
            usarMinhaLocalizacao
        );

    }


    if (formOcorrencia) {

        formOcorrencia.addEventListener(
            "submit",
            cadastrarOcorrencia
        );

    }
}

// =========================================================
// NAVEGAÇÃO - INÍCIO / VOLTAR AO TOPO
// =========================================================

function configurarNavegacaoTopo() {

    const linksTopo = document.querySelectorAll(
        'a[href="#inicio"]'
    );

    linksTopo.forEach(function (link) {

        link.addEventListener(
            "click",
            function (evento) {

                evento.preventDefault();

                window.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: "smooth"
                });

                // Fecha o menu mobile, caso esteja aberto
                if (menuNav) {
                    menuNav.classList.remove("ativo");
                }

                if (menuToggle) {

                    menuToggle.classList.remove("ativo");

                    menuToggle.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                    menuToggle.setAttribute(
                        "aria-label",
                        "Abrir menu"
                    );
                }
            }
        );
    });
}

// =========================================================
// 34. ATUALIZAÇÃO EM TEMPO REAL
// =========================================================
//
// Quando uma ocorrência for alterada no Supabase,
// por exemplo quando o administrador mudar o status,
// o site pode atualizar automaticamente.
// =========================================================

function iniciarAtualizacaoTempoReal() {

    try {

        supabaseClient
            .channel(
                "ocorrencias-publicas"
            )
            .on(
                "postgres_changes",
                {

                    event: "*",

                    schema: "public",

                    table: "ocorrencias"

                },

                function () {

                    carregarOcorrencias();

                }
            )
            .subscribe();


    } catch (erro) {

        // O site continuará funcionando
        // mesmo que o Realtime não esteja
        // disponível.

        console.warn(
            "Atualização em tempo real não disponível:",
            erro
        );

    }
}


// =========================================================
// 35. INICIALIZAÇÃO
// =========================================================

async function iniciarAplicacao() {

    try {

        iniciarMapaPrincipal();

        iniciarMapaCadastro();

        configurarFormulario();

        configurarFiltrosCategoria();

        configurarFiltroStatus();

        configurarMenuMobile();

        configurarNavegacaoTopo();

        atualizarContadorDescricao();


        await carregarOcorrencias();


        iniciarAtualizacaoTempoReal();


        // Leaflet às vezes precisa recalcular
        // o tamanho após o carregamento.

        setTimeout(
            function () {

                if (mapa) {

                    mapa.invalidateSize();

                }


                if (mapaCadastro) {

                    mapaCadastro.invalidateSize();

                }

            },
            300
        );


    } catch (erro) {

        console.error(
            "Erro ao iniciar aplicação:",
            erro
        );


        mostrarToast(
            "Não foi possível iniciar o Mapa Cidadão PG.",
            "erro"
        );

    }
}


// =========================================================
// 36. INICIAR QUANDO O HTML ESTIVER PRONTO
// =========================================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        iniciarAplicacao
    );

} else {

    iniciarAplicacao();

}