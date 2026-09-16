const areaLogin =
    document.getElementById(
        "areaLogin"
    );

const painelAdmin =
    document.getElementById(
        "painelAdmin"
    );

const formLogin =
    document.getElementById(
        "formLogin"
    );

const listaAdmin =
    document.getElementById(
        "listaAdmin"
    );

const erroLogin =
    document.getElementById(
        "erroLogin"
    );

const btnSair =
    document.getElementById(
        "btnSair"
    );


// ==========================================
// ESCAPAR HTML
// ==========================================

function escaparHTML(valor) {

    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// ==========================================
// VERIFICAR LOGIN
// ==========================================

async function verificarLogin() {

    const {
        data
    } =
        await supabaseClient
            .auth
            .getSession();


    if (data.session) {

        areaLogin.style.display =
            "none";

        painelAdmin.style.display =
            "block";

        await carregarAdmin();

    } else {

        areaLogin.style.display =
            "block";

        painelAdmin.style.display =
            "none";

    }

}


// ==========================================
// LOGIN
// ==========================================

formLogin.addEventListener(
    "submit",
    async function (evento) {

        evento.preventDefault();


        erroLogin.textContent =
            "Entrando...";


        const email =
            document
                .getElementById(
                    "emailAdmin"
                )
                .value
                .trim();


        const senha =
            document
                .getElementById(
                    "senhaAdmin"
                )
                .value;


        const {
            data,
            error
        } =
            await supabaseClient
                .auth
                .signInWithPassword({

                    email:
                        email,

                    password:
                        senha

                });


        if (error) {

            console.error(error);

            erroLogin.textContent =
                "E-mail ou senha inválidos.";

            return;

        }


        if (data.session) {

            erroLogin.textContent =
                "";

            areaLogin.style.display =
                "none";

            painelAdmin.style.display =
                "block";

            await carregarAdmin();

        }

    }
);


// ==========================================
// CARREGAR OCORRÊNCIAS
// ==========================================

async function carregarAdmin() {

    listaAdmin.innerHTML =
        "<p>Carregando...</p>";


    const {
        data,
        error
    } =
        await supabaseClient
            .from(
                "ocorrencias"
            )
            .select("*")
            .order(
                "data_cadastro",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(error);

        listaAdmin.innerHTML =
            "<p>Erro ao carregar ocorrências.</p>";

        return;

    }


    listaAdmin.innerHTML = "";


    if (!data.length) {

        listaAdmin.innerHTML =
            "<p>Nenhuma ocorrência cadastrada.</p>";

        return;

    }


    data.forEach(
        function (ocorrencia) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "admin-card";


            card.innerHTML = `

                <div>

                    ${
                        ocorrencia.foto_url
                        ?
                        `
                        <img
                            src="${escaparHTML(
                                ocorrencia.foto_url
                            )}"
                            alt="Foto da ocorrência"
                        >
                        `
                        :
                        ""
                    }

                </div>


                <div>

                    <h2>
                        ${escaparHTML(
                            ocorrencia.tipo_problema
                        )}
                    </h2>


                    <p>
                        <strong>
                            Categoria:
                        </strong>

                        ${escaparHTML(
                            ocorrencia.categoria
                        )}
                    </p>


                    <p>
                        <strong>
                            Bairro:
                        </strong>

                        ${escaparHTML(
                            ocorrencia.bairro ||
                            "Não informado"
                        )}
                    </p>


                    <p>
                        ${escaparHTML(
                            ocorrencia.descricao
                        )}
                    </p>


                    <p>
                        <strong>
                            Status:
                        </strong>
                    </p>


                    <select
                        class="status-admin"
                        data-id="${ocorrencia.id}"
                    >

                        <option
                            value="Registrado"
                            ${
                                ocorrencia.status ===
                                "Registrado"
                                ?
                                "selected"
                                :
                                ""
                            }
                        >
                            🟡 Registrado
                        </option>


                        <option
                            value="Em análise"
                            ${
                                ocorrencia.status ===
                                "Em análise"
                                ?
                                "selected"
                                :
                                ""
                            }
                        >
                            🔵 Em análise
                        </option>


                        <option
                            value="Em manutenção"
                            ${
                                ocorrencia.status ===
                                "Em manutenção"
                                ?
                                "selected"
                                :
                                ""
                            }
                        >
                            🟠 Em manutenção
                        </option>


                        <option
                            value="Resolvido"
                            ${
                                ocorrencia.status ===
                                "Resolvido"
                                ?
                                "selected"
                                :
                                ""
                            }
                        >
                            🟢 Resolvido
                        </option>

                    </select>

                </div>

            `;


            listaAdmin.appendChild(
                card
            );

        }
    );


    document
        .querySelectorAll(
            ".status-admin"
        )
        .forEach(
            function (select) {

                select.addEventListener(
                    "change",
                    alterarStatus
                );

            }
        );

}


// ==========================================
// ALTERAR STATUS
// ==========================================

async function alterarStatus(evento) {

    const select =
        evento.target;


    const id =
        Number(
            select.dataset.id
        );


    const novoStatus =
        select.value;


    select.disabled =
        true;


    const {
        error
    } =
        await supabaseClient
            .from(
                "ocorrencias"
            )
            .update({

                status:
                    novoStatus

            })
            .eq(
                "id",
                id
            );


    select.disabled =
        false;


    if (error) {

        console.error(error);

        alert(
            "Não foi possível alterar o status."
        );

        await carregarAdmin();

        return;

    }


    alert(
        "Status atualizado com sucesso."
    );

}


// ==========================================
// LOGOUT
// ==========================================

btnSair.addEventListener(
    "click",
    async function () {

        await supabaseClient
            .auth
            .signOut();


        painelAdmin.style.display =
            "none";

        areaLogin.style.display =
            "block";

    }
);


// ==========================================
// INICIAR
// ==========================================

verificarLogin();