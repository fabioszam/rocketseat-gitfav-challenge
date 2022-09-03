import { GitHubUser } from "./GitHubUser.js";

class Favorites {
  constructor(root) {
    this.root = document.querySelector(root);
    this.load();
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem("@github-favorites:")) || [];
    this.notFav();
  }

  save() {
    localStorage.setItem("@github-favorites:", JSON.stringify(this.entries));
  }

  async add(username) {
    try {
      const userExists = this.entries.find((entry) => entry.login === username);

      if (userExists) {
        throw new Error("User already registered!");
      }

      const user = await GitHubUser.search(username);

      if (user.login === undefined) {
        throw new Error("User not found!");
      }

      this.entries = [user, ...this.entries];
      this.update();
      this.save();
    } catch (e) {
      alert(e.message);
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(
      (entry) => entry.login !== user.login
    );

    this.entries = filteredEntries;
    this.update();
    this.save();
    this.load();
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root);

    this.tbody = this.root.querySelector("tbody");
    this.fav = document.querySelector("#fav");
    this.radius = document.querySelector("#radius");

    this.update();
    this.onadd();
  }

  onadd() {
    const addButton = this.root.querySelector(".search button");
    const addInput = this.root.querySelector(".search input");

    addInput.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        fav.classList.remove("not-fav");
        radius.classList.remove("not-radius");
        const { value } = this.root.querySelector(".search input");
        this.add(value);
      }
    });

    addButton.onclick = () => {
      fav.classList.remove("not-fav");
      radius.classList.remove("not-radius");
      const { value } = this.root.querySelector(".search input");
      this.add(value);
    };
  }

  notFav() {
    const haveNotFav = localStorage.getItem("@github-favorites:") === "[]";

    if (haveNotFav) {
      fav.classList.add("not-fav");
      radius.classList.add("not-radius");
    }
  }

  update() {
    this.removeAllTr();

    this.entries.forEach((user) => {
      const row = this.createRow();

      row.querySelector(
        ".user img"
      ).src = `http://github.com/${user.login}.png`;
      row.querySelector(".user img").alt = `Picture of ${user.name} `;
      row.querySelector(".user p").textContent = user.name;
      row.querySelector(".user a").href = `https://github.com/${user.login}`;
      row.querySelector(".user span").textContent = `/${user.login}`;
      row.querySelector(".repositories").textContent = user.public_repos;
      row.querySelector(".followers").textContent = user.followers;

      row.querySelector(".remove").onclick = () => {
        const isOk = confirm("Are you sure you want to delete this user?");
        if (isOk) {
          this.delete(user);
        }
      };

      this.tbody.append(row);
    });
  }

  createRow() {
    const tr = document.createElement("tr");

    tr.innerHTML = `
    <td class="user">
      <img
        src="https://github.com/fabioszam.png"
        alt="Picture of Fábio"
      />
      <a href="https://github.com/fabioszam" target="_blank">
        <p>Fábio Szamszoryk</p>
        <span>&#47;fabioszam</span>
      </a>
    </td>
    <td class="repositories">16</td>
    <td class="followers">0</td>
    <td class="remove"><span>Remove</span></td>
    `;

    return tr;
  }

  removeAllTr() {
    this.tbody.querySelectorAll("tr").forEach((tr) => {
      tr.remove();
    });
  }
}
