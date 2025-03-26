export function x2damage(multiDamage) {
    const skillContainer = document.querySelector(".skill");
  
    const button = document.createElement("button");
    // button.style.background = "url('./src/skills/img/x2damage.png')";
    button.classList.add("appear");
    
  
    button.addEventListener("click", function () {
      multiDamage *= 2;
      document.getElementById("DM").textContent = multiDamage;
      button.classList.remove("appear");
      button.classList.add("hide");
      button.addEventListener("transitionend", function handleTransitionEnd() {
        button.removeEventListener("transitionend", handleTransitionEnd);
        skillContainer.removeChild(button);
      });
    }, { once: true });
    skillContainer.appendChild(button);
}

export function fastBullet(shootingSpeed) {
    const skillContainer = document.querySelector(".skill");

    const button = document.createElement("button");
    // button.style.background = "url('./src/skills/img/speedShooting.png')";
    button.classList.add("appear");
    
  
    button.addEventListener("click", function () {
      document.getElementById("shooting-speed").textContent = shootingSpeed * 0.8;
      button.classList.remove("appear");
      button.classList.add("hide");
      button.addEventListener("transitionend", function handleTransitionEnd() {
        button.removeEventListener("transitionend", handleTransitionEnd);
        skillContainer.removeChild(button);
      });
    }, { once: true });
    skillContainer.appendChild(button);
} 