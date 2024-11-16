import "./style.css";
import "./queries.css";
import { useEffect, useState } from "react";
import supabase from "./supabase";

const categoriesArr = [
	{ name: "technology", color: "#3b82f6" },
	{ name: "science", color: "#16a34a" },
	{ name: "finance", color: "#ef4444" },
	{ name: "society", color: "#eab308" },
	{ name: "entertainment", color: "#db2777" },
	{ name: "health", color: "#14b8a6" },
	{ name: "history", color: "#f97316" },
	{ name: "news", color: "#8b5cf6" }
];

function App() {
	const [showForm, setShowForm] = useState(false);
	const [facts, setFacts] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [currentCategory, setCurrentCategory] = useState("all");

	useEffect(
		function () {
			async function getFacts() {
				setIsLoading(true);
				let query = supabase.from("facts").select("*");
				if (currentCategory !== "all")
					query = query.eq("category", currentCategory);
				const { data: facts, error } = await query
					.order("created_at", { ascending: false })
					.limit(1000);
				if (error) {
					alert(`Error while fetching facts from Supabase. ${error.message}`);
				} else {
					setIsLoading(false);
					setFacts(facts);
				}
			}
			getFacts();
		},
		[currentCategory]
	);

	return (
		<>
			<Header showForm={showForm} setShowForm={setShowForm} />
			{showForm ? (
				<FactForm setFacts={setFacts} setShowForm={setShowForm} />
			) : null}
			<main className="main">
				<CategoryFilter setCurrentCategory={setCurrentCategory} />
				{isLoading ? (
					<Loader />
				) : (
					<FactsList
						facts={facts}
						setFacts={setFacts}
						currentCategory={currentCategory}
						setCurrentCategory={setCurrentCategory}
					/>
				)}
			</main>
		</>
	);
}

function Loader() {
	return <p className="message">Loading...</p>;
}

function Header({ showForm, setShowForm }) {
	const appTitle = "Today I Learned";
	return (
		<header className="header">
			<div className="logo">
				<img
					src="./logo.png"
					height="68"
					width="68"
					alt="Today I Learned logo"
				/>
				<h1 className="title">{appTitle}</h1>
			</div>
			<button
				className="btn btn--large"
				id="share-a-fact"
				onClick={() => setShowForm((show) => !show)}>
				{showForm ? "Close" : "Share a fact"}
			</button>
		</header>
	);
}

function isValidUrl(string) {
	let url;

	try {
		url = new URL(string);
	} catch (_) {
		console.error(
			"Invalid source URL. Make sure to add `http://` or `https://` at the beginning"
		);
		return false;
	}

	return url.protocol === "http:" || url.protocol === "https:";
}

function FactForm({ setFacts, setShowForm }) {
	const [text, setText] = useState("");
	const [source, setSource] = useState("http://");
	const [category, setCategory] = useState("");
	const [isUploading, setIsUploading] = useState(false);
	const textLength = text.length;
	async function handleSubmit(e) {
		e.preventDefault();
		if (text && isValidUrl(source) && category && textLength <= 200) {
			setIsUploading(true);
			const { data: newFact, error } = await supabase
				.from("facts")
				.insert([{ text, source, category }])
				.select();
			if (!error) {
				setIsUploading(false);
				setFacts((facts) => [newFact[0], ...facts]);
				setText("");
				setSource("");
				setCategory("");
				setShowForm(false);
			} else alert(`Error while submitting fact. ${error.message}`);
		} else alert("Invalid inputs. Please check and try again.");
	}
	return (
		<form className="form" onSubmit={handleSubmit}>
			<input
				type="text"
				placeholder="Share a fact with the world..."
				value={text}
				onChange={(e) => setText(e.target.value)}
				size={200}
				disabled={isUploading}
			/>
			<span>{200 - textLength}</span>
			<input
				type="text"
				placeholder="Trustworthy source..."
				value={source}
				onChange={(e) => setSource(e.target.value)}
				disabled={isUploading}
			/>
			<select
				value={category}
				disabled={isUploading}
				onChange={(e) => setCategory(e.target.value)}>
				<option value="">Choose category</option>
				{categoriesArr.map((cat) => (
					<option key={cat.name} value={cat.name}>
						{cat.name.toUpperCase()}
					</option>
				))}
			</select>
			<button className="btn btn--large" disabled={isUploading}>
				Post
			</button>
		</form>
	);
}

function CategoryFilter({ setCurrentCategory }) {
	return (
		<aside>
			<ul id="categories-list">
				<li className="category">
					<button
						className="btn btn--all"
						onClick={() => setCurrentCategory("all")}>
						All
					</button>
				</li>
				{categoriesArr.map((cat) => (
					<li className="category" key={cat.name}>
						<button
							className="btn btn--category"
							style={{ backgroundColor: `${cat.color}` }}
							onClick={() => setCurrentCategory(cat.name)}>
							{cat.name}
						</button>
					</li>
				))}
			</ul>
		</aside>
	);
}

function FactsList({ facts, setFacts, currentCategory, setCurrentCategory }) {
	if (facts.length === 0) {
		return (
			<p className="message">
				No facts for this category, yet. Create a new one now.
			</p>
		);
	}

	return (
		<section>
			<p style={{ marginBottom: "16px" }}>
				There are now {facts.length} fact{facts.length === 1 ? "" : "s"} in the
				database
				{currentCategory !== "all"
					? ` in ${currentCategory.toUpperCase()} category.`
					: "."}
			</p>
			<ul className="facts-list">
				{facts.map((fact) => (
					<Fact
						key={fact.id}
						fact={fact}
						setCurrentCategory={setCurrentCategory}
						setFacts={setFacts}
					/>
				))}
			</ul>
		</section>
	);
}

function Fact({ fact, setCurrentCategory, setFacts }) {
	const [isUpdating, setIsUpdating] = useState(false);
	const isDisputed =
		fact.vote_interesting + fact.vote_mindBlowing < fact.vote_false;
	async function handleVote(vote) {
		if (vote) {
			setIsUpdating(true);
			const { data: updatedFact, error } = await supabase
				.from("facts")
				.update({ [vote]: fact[vote] + 1 })
				.eq("id", fact.id)
				.select();
			if (!error) {
				setIsUpdating(false);
				setFacts((facts) =>
					facts.map((f) => (f.id === fact.id ? updatedFact[0] : f))
				);
			}
		}
	}

	return (
		<li className="fact">
			<p>
				{isDisputed ? <span className="disputed">[DISPUTED] </span> : ""}
				{fact.text}
				<a
					className="source"
					href={fact.source}
					target="_blank"
					rel="noreferrer">
					(Source)
				</a>
			</p>
			<span
				className="tag"
				style={{
					backgroundColor:
						categoriesArr.find((cat) => cat.name === fact.category)?.color ??
						"#78716c"
				}}
				onClick={() => setCurrentCategory(fact.category)}>
				{fact.category}
			</span>
			<div className="vote-buttons">
				<button
					onClick={() => handleVote("vote_interesting")}
					disabled={isUpdating}>
					👍 {fact.vote_interesting}
				</button>
				<button
					onClick={() => handleVote("vote_mindBlowing")}
					disabled={isUpdating}>
					🤯 {fact.vote_mindBlowing}
				</button>
				<button onClick={() => handleVote("vote_false")} disabled={isUpdating}>
					⛔ {fact.vote_false}
				</button>
			</div>
		</li>
	);
}

export default App;
