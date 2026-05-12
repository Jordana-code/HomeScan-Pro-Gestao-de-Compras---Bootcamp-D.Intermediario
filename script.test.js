// Exemplo de Teste de Integração simples
test('Deve buscar uma frase da API e exibir no elemento', async () => {
    // Simulação do fetch
    global.fetch = jest.fn(() =>
        Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ content: "Success", responseData: { translatedText: "Sucesso" } }),
        })
    );

    await fetchPortugueseAdvice();
    const apiPhrase = document.getElementById('api-phrase');
    expect(apiPhrase.innerText).toContain("Sucesso");
});