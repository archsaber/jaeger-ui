import * as React from 'react';

class Form extends React.Component {
    render() {
        const domTree = (
            <form id={this.props.id} action={this.props.action} onKeyDown={this.onFormKeyDown} onSubmit={this.onFormSubmit}>
                {this.props.children}
            </form>
        );

        return domTree;
    }

    onFormKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.props.onSubmit();
        }
    };

    onFormSubmit = (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.props.onSubmit();
    };
}

export default Form;
