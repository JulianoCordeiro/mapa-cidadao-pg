// =========================================================
// MAPA CIDADÃO PG
// CONFIGURAÇÃO DO SUPABASE
// =========================================================


// ---------------------------------------------------------
// 1. DADOS DO PROJETO SUPABASE
// ---------------------------------------------------------

const SUPABASE_URL =
    "https://mqpxpjgaloaprnphnewk.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_IP0g9WfPnwBdX1bAtYrRfQ_sMcbHjcF";


// ---------------------------------------------------------
// 2. VERIFICAR BIBLIOTECA
// ---------------------------------------------------------

if (typeof window.supabase === "undefined") {

    console.error(
        "A biblioteca do Supabase não foi carregada."
    );

    throw new Error(
        "Supabase não disponível."
    );
}


// ---------------------------------------------------------
// 3. CRIAR CLIENTE SUPABASE
// ---------------------------------------------------------

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY,
        {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true
            }
        }
    );


// ---------------------------------------------------------
// 4. CONFIRMAÇÃO
// ---------------------------------------------------------

console.log(
    "Mapa Cidadão PG: Supabase inicializado."
);