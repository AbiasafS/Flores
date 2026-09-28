window.onload = () => {
  const btnStart = document.getElementById("btn-start");
  const body = document.body;

  // 1. Evento para el botón principal
  if (btnStart) {
    btnStart.addEventListener("click", (e) => {
      e.stopPropagation(); // Evita que al pulsar el botón se generen luciérnagas de inmediato
      
      // Inicia el crecimiento de las flores
      body.classList.remove("container");
      
      // Oculta el botón
      btnStart.classList.add("hidden");
      
      // Inicia la lluvia de pétalos infinita
      iniciarLluviaPetalos();
    });
  }

  // 2. Efecto de luciérnagas al hacer clic / tocar en la pantalla
  document.addEventListener('click', (e) => {
    // Solo permitir luciérnagas si ya presionamos el botón (si ya no tiene la clase container)
    if (!body.classList.contains("container") && e.clientX !== undefined && e.clientY !== undefined) {
      crearGrupoLuciernagas(e.clientX, e.clientY);
    }
  });
};

/* --- FUNCIÓN DE LUCIÉRNAGAS --- */
function crearGrupoLuciernagas(x, y) {
  const cantidad = 12; 

  for (let i = 0; i < cantidad; i++) {
    const particle = document.createElement('div');
    particle.classList.add('firefly-click');
    
    const angulo = Math.random() * Math.PI * 2;
    const radio = Math.random() * 50; 
    const offsetX = Math.cos(angulo) * radio;
    const offsetY = Math.sin(angulo) * radio;
    
    particle.style.left = `${x + offsetX}px`;
    particle.style.top = `${y + offsetY}px`;
    
    const size = Math.random() * 5 + 4;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    
    const duracion = Math.random() * 1.5 + 1.5;
    particle.style.animationDuration = `${duracion}s`;
    
    document.body.appendChild(particle);
    
    setTimeout(() => {
      particle.remove();
    }, duracion * 1000);
  }
}

/* --- FUNCIÓN DE PÉTALOS INFINITOS --- */
function iniciarLluviaPetalos() {
  // Crea un pétalo nuevo cada 400 milisegundos (puedes bajar el número para que haya más)
  setInterval(crearPetalo, 400); 
}

function crearPetalo() {
  const petal = document.createElement("div");
  petal.classList.add("petal");
  
  // Aparece en una posición horizontal segura (4% a 96% del ancho)
  petal.style.left = `${Math.random() * 92 + 4}vw`;
  
  // Tiempo de caída aleatorio (entre 5 y 10 segundos para que caigan a diferentes velocidades)
  const fallDuration = Math.random() * 5 + 5;
  petal.style.animationDuration = `${fallDuration}s`;
  
  // Tamaño aleatorio del pétalo
  const size = Math.random() * 10 + 10;
  petal.style.width = `${size}px`;
  petal.style.height = `${size}px`;
  
  document.body.appendChild(petal);
  
  // Elimina el pétalo del código una vez que sale de la pantalla para no saturar la memoria
  setTimeout(() => {
    petal.remove();
  }, fallDuration * 1000);
}