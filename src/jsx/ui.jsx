var React = require('react');
var ReactDOM = require('react-dom');

function GoButton(props) {
	return <input type="button" className="btn btn-success" value={props.text} onClick={props.click}></input>;

}

function PasswordBox(props) {
	return (
		<div className="input-group mb-3" style={{ y: '50%' }}>
			<div className="input-group-prepend">
				<span className="input-group-text">{props.description}</span>
			</div>
			<input
				type="password"
				className="form-control"
				placeholder="Password"
				onChange={props.change}
				id={props.id}
				onKeyPress={event => event.key === 'Enter' && props.enter()}
			/>
		</div>
	);

}

function Warning(props) {
	return (
		<div className="invalid-tooltip" style={{ position: 'relative', display: 'block' }}>
			{props.text}
		</div>
	);
}

function GrayBoxTitleBr(props) {
	return (
		<div>
			<h2>{props.title}</h2>
			<br></br>
		</div>
	);
}

function GrayCenterBox(props) {
	return (
		<div className="vertical-center">
			<div className="container jumbotron">
				{props.children}
			</div>
		</div>
	);
}

function UnlockPasswordBox(props) {
	return (
		<GrayCenterBox>
			<GrayBoxTitleBr title="Unlock:" />
			{props.valid == false &&
				<Warning text="Wrong password." />
			}
			<PasswordBox id="loginPass" description="Password:" enter={function () { login(); }} />
			<GoButton text={props.valid ? 'Unlock' : 'Try Again'} click={function () { login(); }} />
		</GrayCenterBox>
	);
}

function SetPasswordBox(props) {
	return (
		<GrayCenterBox>
			<GrayBoxTitleBr title="Choose your password:" />
			{props.longenough == false &&
				<Warning text="Password must be at least 6 characters long." />
			}
			<PasswordBox id="registerpass" description="Password:" enter={function () { checkAndRegPass(); }} change={function () { checkNewPass(); }} />
			{props.same == false &&
				<Warning text="Passwords do not match." />
			}
			<PasswordBox id="verifypass" description="Verify password:" enter={function () { checkAndRegPass(); }} change={function () { checkNewPass(); }} />
			<GoButton text={props.same ? 'Set Password' : 'Try Again'} click={function () { checkAndRegPass(); }} />
		</GrayCenterBox>
	);
}

function IndexingLoadBox(props) {
	return (
		<GrayCenterBox>
			<h4>Indexing Entries...</h4>
		</GrayCenterBox>
	);
}

function unlock(valid) {
	ReactDOM.render(<UnlockPasswordBox valid={valid} />, document.getElementById('react-app'));
}

function setpassword(longenough, same) {
	ReactDOM.render(<SetPasswordBox longenough={longenough} same={same} />, document.getElementById('react-app'));
}

function indexing() {
	ReactDOM.render(<IndexingLoadBox />, document.getElementById('react-app'));
}

exports.unlock = unlock;
exports.setpassword = setpassword;
exports.indexing = indexing;