// ==========================================
// CONFIGURAÇÃO INICIAL
// ==========================================

let dataAtual = obterDataHoje();

let solicitacoes = JSON.parse(
    localStorage.getItem("agendaSolicitacoes")
) || [];

let afazeres = JSON.parse(
    localStorage.getItem("agendaAfazeres")
) || [];


// ==========================================
// INICIALIZAÇÃO
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    document.getElementById("dataAgenda").value = dataAtual;

    atualizarTextoData();

    renderizarSolicitacoes();

    renderizarAfazeres();

});


// ==========================================
// DATA
// ==========================================

function obterDataHoje() {

    const hoje = new Date();

    const ano = hoje.getFullYear();

    const mes = String(hoje.getMonth() + 1).padStart(2, "0");

    const dia = String(hoje.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}


function mudarDia(valor) {

    const data = new Date(dataAtual + "T12:00:00");

    data.setDate(data.getDate() + valor);

    const ano = data.getFullYear();

    const mes = String(data.getMonth() + 1).padStart(2, "0");

    const dia = String(data.getDate()).padStart(2, "0");

    dataAtual = `${ano}-${mes}-${dia}`;

    document.getElementById("dataAgenda").value = dataAtual;

    atualizarTextoData();

    renderizarSolicitacoes();

    renderizarAfazeres();

}


function alterarData() {

    dataAtual = document.getElementById("dataAgenda").value;

    atualizarTextoData();

    renderizarSolicitacoes();

    renderizarAfazeres();

}


function formatarData(data) {

    if (!data) {
        return "";
    }

    const partes = data.split("-");

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}


function atualizarTextoData() {

    const elemento = document.getElementById("textoDataAfazeres");

    if (elemento) {
        elemento.textContent =
            `Tarefas do dia ${formatarData(dataAtual)}`;
    }

}


// ==========================================
// TROCAR PÁGINAS
// ==========================================

function mostrarPagina(pagina, botao) {

    const solicitacoesPagina =
        document.getElementById("paginaSolicitacoes");

    const afazeresPagina =
        document.getElementById("paginaAfazeres");

    const btnSolicitacoes =
        document.getElementById("btnSolicitacoes");

    const btnAfazeres =
        document.getElementById("btnAfazeres");

    const menuItems =
        document.querySelectorAll(".menu-item");


    if (pagina === "solicitacoes") {

        solicitacoesPagina.classList.remove("hidden");

        afazeresPagina.classList.add("hidden");

        btnSolicitacoes.classList.add("active");

        btnAfazeres.classList.remove("active");

        menuItems[0].classList.add("active");

        menuItems[1].classList.remove("active");

    }


    if (pagina === "afazeres") {

        solicitacoesPagina.classList.add("hidden");

        afazeresPagina.classList.remove("hidden");

        btnSolicitacoes.classList.remove("active");

        btnAfazeres.classList.add("active");

        menuItems[0].classList.remove("active");

        menuItems[1].classList.add("active");

    }

}


// ==========================================
// SOLICITAÇÕES
// ==========================================

function abrirModalSolicitacao() {

    document.getElementById("formSolicitacao").reset();

    document.getElementById("idSolicitacao").value = "";

    document.getElementById(
        "tituloModalSolicitacao"
    ).textContent = "Adicionar Solicitação";

    document.getElementById(
        "modalSolicitacao"
    ).classList.add("show");

}


function fecharModalSolicitacao() {

    document.getElementById(
        "modalSolicitacao"
    ).classList.remove("show");

}


function salvarSolicitacao(event) {

    event.preventDefault();


    const id =
        document.getElementById("idSolicitacao").value;

    const codigo =
        document.getElementById("codigoSolicitacao").value.trim();

    const procedimento =
        document.getElementById("procedimento").value.trim();

    const status =
        document.getElementById("statusSolicitacao").value;


    if (!codigo || !procedimento || !status) {
        return;
    }


    if (id) {

        const solicitacao =
            solicitacoes.find(item => item.id == id);

        if (solicitacao) {

            solicitacao.codigo = codigo;

            solicitacao.procedimento = procedimento;

            solicitacao.status = status;

        }

    } else {

        const novaSolicitacao = {

            id: Date.now(),

            data: dataAtual,

            codigo: codigo,

            procedimento: procedimento,

            status: status

        };

        solicitacoes.push(novaSolicitacao);

    }


    salvarDados();

    renderizarSolicitacoes();

    fecharModalSolicitacao();

}


function renderizarSolicitacoes() {

    const tabela =
        document.getElementById("tabelaSolicitacoes");

    const vazio =
        document.getElementById("semSolicitacoes");


    const pesquisa =
        document.getElementById("pesquisa").value
            .toLowerCase()
            .trim();

    const filtro =
        document.getElementById("filtroStatus").value;


    let registros =
        solicitacoes.filter(item => item.data === dataAtual);


    // Pesquisa
    if (pesquisa) {

        registros = registros.filter(item =>

            item.codigo.toLowerCase().includes(pesquisa) ||

            item.procedimento.toLowerCase().includes(pesquisa)

        );

    }


    // Filtro
    if (filtro !== "todos") {

        registros =
            registros.filter(item => item.status === filtro);

    }


    tabela.innerHTML = "";


    if (registros.length === 0) {

        vazio.style.display = "block";

        return;

    }


    vazio.style.display = "none";


    registros.forEach(item => {

        const tr = document.createElement("tr");


        tr.innerHTML = `

            <td>
                <strong>${escaparHTML(item.codigo)}</strong>
            </td>

            <td>
                ${criarStatus(item.status)}
            </td>

            <td>
                ${escaparHTML(item.procedimento)}
            </td>

            <td>

                <div class="action-buttons">

                    <button
                        class="btn-edit"
                        onclick="editarSolicitacao(${item.id})"
                        title="Editar">

                        <i class="fa-solid fa-pen"></i>

                    </button>

                    <button
                        class="btn-delete"
                        onclick="excluirSolicitacao(${item.id})"
                        title="Excluir">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>

            </td>

        `;


        tabela.appendChild(tr);

    });

}


// ==========================================
// STATUS
// ==========================================

function criarStatus(status) {

    let classe = "";

    let icone = "";


    switch (status) {

        case "Autorizado":

            classe = "status-autorizado";

            icone = "fa-circle-check";

            break;


        case "Código interno inválido":

            classe = "status-invalido";

            icone = "fa-circle-xmark";

            break;


        case "Pendente":

            classe = "status-pendente";

            icone = "fa-clock";

            break;


        case "Reenviar":

            classe = "status-reenviar";

            icone = "fa-rotate";

            break;

    }


    return `

        <span class="status ${classe}">

            <i class="fa-solid ${icone}"></i>

            ${escaparHTML(status)}

        </span>

    `;

}


// ==========================================
// EDITAR SOLICITAÇÃO
// ==========================================

function editarSolicitacao(id) {

    const item =
        solicitacoes.find(item => item.id == id);

    if (!item) {
        return;
    }


    document.getElementById("idSolicitacao").value =
        item.id;

    document.getElementById("codigoSolicitacao").value =
        item.codigo;

    document.getElementById("procedimento").value =
        item.procedimento;

    document.getElementById("statusSolicitacao").value =
        item.status;


    document.getElementById(
        "tituloModalSolicitacao"
    ).textContent = "Editar Solicitação";


    document.getElementById(
        "modalSolicitacao"
    ).classList.add("show");

}


// ==========================================
// EXCLUIR SOLICITAÇÃO
// ==========================================

function excluirSolicitacao(id) {

    const confirmar =
        confirm("Deseja realmente excluir esta solicitação?");


    if (!confirmar) {
        return;
    }


    solicitacoes =
        solicitacoes.filter(item => item.id != id);


    salvarDados();

    renderizarSolicitacoes();

}


// ==========================================
// AFAZERES
// ==========================================

function abrirModalAfazer() {

    document.getElementById("formAfazer").reset();

    document.getElementById("idAfazer").value = "";

    document.getElementById("dataAfazer").value =
        dataAtual;

    document.getElementById(
        "tituloModalAfazer"
    ).textContent = "Adicionar Afazer";


    document.getElementById(
        "modalAfazer"
    ).classList.add("show");

}


function fecharModalAfazer() {

    document.getElementById(
        "modalAfazer"
    ).classList.remove("show");

}


function salvarAfazer(event) {

    event.preventDefault();


    const id =
        document.getElementById("idAfazer").value;

    const descricao =
        document.getElementById("descricaoAfazer").value.trim();

    const data =
        document.getElementById("dataAfazer").value;

    const status =
        document.getElementById("statusAfazer").value;


    if (!descricao || !data || !status) {
        return;
    }


    if (id) {

        const item =
            afazeres.find(item => item.id == id);

        if (item) {

            item.descricao = descricao;

            item.data = data;

            item.status = status;

        }

    } else {

        afazeres.push({

            id: Date.now(),

            descricao: descricao,

            data: data,

            status: status

        });

    }


    salvarDados();

    renderizarAfazeres();

    fecharModalAfazer();

}


// ==========================================
// RENDERIZAR AFAZERES
// ==========================================

function renderizarAfazeres() {

    const tabela =
        document.getElementById("tabelaAfazeres");

    const vazio =
        document.getElementById("semAfazeres");


    const registros =
        afazeres.filter(item => item.data === dataAtual);


    tabela.innerHTML = "";


    if (registros.length === 0) {

        vazio.style.display = "block";

        return;

    }


    vazio.style.display = "none";


    registros.forEach(item => {

        const tr = document.createElement("tr");


        tr.innerHTML = `

            <td>
                ${escaparHTML(item.descricao)}
            </td>

            <td>
                ${formatarData(item.data)}
            </td>

            <td>
                ${criarStatusAfazer(item.status)}
            </td>

            <td>

                <div class="action-buttons">

                    <button
                        class="btn-edit"
                        onclick="editarAfazer(${item.id})"
                        title="Editar">

                        <i class="fa-solid fa-pen"></i>

                    </button>

                    <button
                        class="btn-delete"
                        onclick="excluirAfazer(${item.id})"
                        title="Excluir">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>

            </td>

        `;


        tabela.appendChild(tr);

    });

}


// ==========================================
// STATUS DOS AFAZERES
// ==========================================

function criarStatusAfazer(status) {

    let classe = "";

    let icone = "";


    switch (status) {

        case "Concluído":

            classe = "status-autorizado";

            icone = "fa-circle-check";

            break;


        case "Pendente":

            classe = "status-pendente";

            icone = "fa-clock";

            break;


        case "Em andamento":

            classe = "status-reenviar";

            icone = "fa-spinner";

            break;

    }


    return `

        <span class="status ${classe}">

            <i class="fa-solid ${icone}"></i>

            ${escaparHTML(status)}

        </span>

    `;

}


// ==========================================
// EDITAR AFAZER
// ==========================================

function editarAfazer(id) {

    const item =
        afazeres.find(item => item.id == id);

    if (!item) {
        return;
    }


    document.getElementById("idAfazer").value =
        item.id;

    document.getElementById("descricaoAfazer").value =
        item.descricao;

    document.getElementById("dataAfazer").value =
        item.data;

    document.getElementById("statusAfazer").value =
        item.status;


    document.getElementById(
        "tituloModalAfazer"
    ).textContent = "Editar Afazer";


    document.getElementById(
        "modalAfazer"
    ).classList.add("show");

}


// ==========================================
// EXCLUIR AFAZER
// ==========================================

function excluirAfazer(id) {

    const confirmar =
        confirm("Deseja realmente excluir este afazer?");


    if (!confirmar) {
        return;
    }


    afazeres =
        afazeres.filter(item => item.id != id);


    salvarDados();

    renderizarAfazeres();

}


// ==========================================
// SALVAR NO NAVEGADOR
// ==========================================

function salvarDados() {

    localStorage.setItem(
        "agendaSolicitacoes",
        JSON.stringify(solicitacoes)
    );

    localStorage.setItem(
        "agendaAfazeres",
        JSON.stringify(afazeres)
    );

}


// ==========================================
// PROTEÇÃO CONTRA HTML
// ==========================================

function escaparHTML(texto) {

    const div = document.createElement("div");

    div.textContent = texto;

    return div.innerHTML;

}


// ==========================================
// FECHAR MODAIS CLICANDO FORA
// ==========================================

window.addEventListener("click", function (event) {

    const modalSolicitacao =
        document.getElementById("modalSolicitacao");

    const modalAfazer =
        document.getElementById("modalAfazer");


    if (event.target === modalSolicitacao) {

        fecharModalSolicitacao();

    }


    if (event.target === modalAfazer) {

        fecharModalAfazer();

    }

});


// ==========================================
// ESC - FECHAR MODAL
// ==========================================

document.addEventListener("keydown", function (event) {

    if (event.key === "Escape") {

        fecharModalSolicitacao();

        fecharModalAfazer();

    }

});