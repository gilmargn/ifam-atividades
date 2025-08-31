        class AlgorithmLoader {
               constructor() {
                this.loadedScripts = new Set();
                this.algorithms = {};
                this.setupEventListeners();
            }

            setupEventListeners() {
                document.getElementById("executeBtn").addEventListener("click", () => {
                    this.executeSelectedAlgorithm();
                });
            }

            async executeSelectedAlgorithm() {
                try {
                    const selectedRadio = document.querySelector('input[name="algorithm"]:checked');
                    if (!selectedRadio) {
                        this.showError("Nenhum algoritmo selecionado!");
                        return;
                    }

                    const algorithmName = selectedRadio.value;
                    const fileName = `${algorithmName}.js`;
                    
                    this.showLoading(true);
                    this.hideResults();

                    // Load the algorithm file if not already loaded
                    await this.loadAlgorithmFile(fileName, algorithmName);

                    // Execute the algorithm
                    await this.runAlgorithm(algorithmName);

                } catch (error) {
                    console.error('Erro ao executar algoritmo:', error);
                    this.showError(`Erro: ${error.message}`);
                } finally {
                    this.showLoading(false);
                }
            }

            async loadAlgorithmFile(fileName, algorithmName) {
                // If already loaded, skip
                if (this.loadedScripts.has(fileName)) {
                    console.log(`${fileName} já carregado`);
                    return;
                }

                return new Promise((resolve, reject) => {
                    // Remove any existing script with the same name
                    const existingScript = document.querySelector(`script[data-algorithm="${algorithmName}"]`);
                    if (existingScript) {
                        existingScript.remove();
                    }

                    const script = document.createElement('script');
                    script.src = `./${fileName}`;
                    script.setAttribute('data-algorithm', algorithmName);
                    
                    script.onload = () => {
                        console.log(`${fileName} carregado com sucesso`);
                        this.loadedScripts.add(fileName);
                        resolve();
                    };

                    script.onerror = () => {
                        reject(new Error(`Falha ao carregar ${fileName}. Verifique se o arquivo existe.`));
                    };

                    document.head.appendChild(script);
                });
            }

            async runAlgorithm(algorithmName) {
                // Try different possible function names
                const possibleNames = [
                    algorithmName,                    // exercise0
                    `run${this.capitalize(algorithmName)}`, // runExercise0
                    `${algorithmName}Algorithm`,      // exercise0Algorithm
                    'main',                           // main
                    'run',                            // run
                    'execute'                         // execute
                ];

                let algorithmFunction = null;

                // Find the algorithm function
                for (const name of possibleNames) {
                    if (typeof window[name] === 'function') {
                        algorithmFunction = window[name];
                        break;
                    }
                }

                if (!algorithmFunction) {
                    throw new Error(`Função não encontrada para ${algorithmName}. Verifique se o arquivo exporta uma das seguintes funções: ${possibleNames.join(', ')}`);
                }

                // Execute the algorithm
                console.log(`Executando ${algorithmName}...`);
                const result = await algorithmFunction();
                
                this.showResults(algorithmName, result);
            }

            showResults(algorithmName, result) {
                const resultsDiv = document.getElementById('results');
                const outputDiv = document.getElementById('output');
                
                let output = `<p><strong>Algoritmo:</strong> ${algorithmName}</p>`;
                
                if (result !== undefined) {
                    if (typeof result === 'object') {
                        output += `<pre><code>${JSON.stringify(result, null, 2)}</code></pre>`;
                    } else {
                        output += `<p><strong>Resultado:</strong> ${result}</p>`;
                    }
                } else {
                    output += `<p><em>Algoritmo executado com sucesso!</em></p>`;
                }

                outputDiv.innerHTML = output;
                resultsDiv.style.display = 'block';
            }

            showError(message) {
                const resultsDiv = document.getElementById('results');
                const outputDiv = document.getElementById('output');
                
                outputDiv.innerHTML = `<div class="notification is-danger">${message}</div>`;
                resultsDiv.style.display = 'block';
            }

            showLoading(show) {
                const loading = document.getElementById('loading');
                const button = document.getElementById('executeBtn');
                
                if (show) {
                    loading.style.display = 'block';
                    button.style.display = 'none';
                } else {
                    loading.style.display = 'none';
                    button.style.display = 'inline-flex';
                }
            }

            hideResults() {
                document.getElementById('results').style.display = 'none';
            }

            capitalize(str) {
                return str.charAt(0).toUpperCase() + str.slice(1);
            }
        }

        // Initialize the algorithm loader when the page loads
        document.addEventListener('DOMContentLoaded', () => {
            new AlgorithmLoader();
    });
    
  