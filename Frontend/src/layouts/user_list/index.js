import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography } from '@mui/material';
import { IconButton } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import CheckIcon from '@mui/icons-material/Check';

const UserModerationPage = () => {
    const [users, setUsers] = useState([]);

    // Simulazione di una chiamata API per ottenere gli utenti
    useEffect(() => {
        const fetchUsers = async () => {
            // Chiamata API per ottenere la lista utenti
            // Questo è solo un mock, sostituiscilo con la tua chiamata API reale
            const response = [
                { id: 1, name: 'Mario Rossi', email: 'mario@rossi.com', isSuspended: false },
                { id: 2, name: 'Luca Bianchi', email: 'luca@bianchi.com', isSuspended: false },
                { id: 3, name: 'Anna Verdi', email: 'anna@verdi.com', isSuspended: true }
            ];
            setUsers(response);
        };
        fetchUsers();
    }, []);

    // Funzione per sospendere o ripristinare un utente
    const handleSuspendToggle = (userId) => {
        setUsers(users.map(user => 
            user.id === userId ? { ...user, isSuspended: !user.isSuspended } : user
        ));
        // Chiamata API per sospendere/ripristinare l'utente
        // es: apiCall(`/suspendUser/${userId}`, { method: 'POST' })
    };

    return (
        <TableContainer component={Paper} sx={{ paddingLeft: "300px" }}>
            <Typography variant="h4" component="h2" sx={{ m: 2 }}>User management</Typography>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>State</TableCell>
                        <TableCell>Action</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.isSuspended ? 'Suspended' : 'Active'}</TableCell>
                            <TableCell>
                                <IconButton
                                    color={user.isSuspended ? 'secondary' : 'primary'}
                                    onClick={() => handleSuspendToggle(user.id)}
                                >
                                    {user.isSuspended ? <CheckIcon /> : <BlockIcon />}
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default UserModerationPage;