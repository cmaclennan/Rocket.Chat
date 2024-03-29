import type { IMessage } from '@rocket.chat/core-typings';
import {
	MessageHeader as FuselageMessageHeader,
	MessageName,
	MessageTimestamp,
	MessageUsername,
	MessageStatusPrivateIndicator,
	MessageNameContainer,
} from '@rocket.chat/fuselage';
import { useTranslation } from '@rocket.chat/ui-contexts';
import type { ReactElement } from 'react';
import React, { memo } from 'react';

import { useUserData } from '../../hooks/useUserData';
import { getUserDisplayName } from '../../lib/getUserDisplayName';
import type { UserPresence } from '../../lib/presence';
import {
	useMessageListShowUsername,
	useMessageListShowRealName,
	useMessageListShowRoles,
} from '../../views/room/MessageList/contexts/MessageListContext';
import { useMessageActions } from '../../views/room/contexts/MessageContext';
import StatusIndicators from './StatusIndicators';
import MessageRoles from './header/MessageRoles';
import { useMessageRoles } from './header/hooks/useMessageRoles';

type MessageHeaderProps = {
	message: IMessage;
};

const MessageHeader = ({ message }: MessageHeaderProps): ReactElement => {
	const t = useTranslation();
	const {
		actions: { openUserCard },
		formatters,
	} = useMessageActions();

	const showRealName = useMessageListShowRealName();
	const user: UserPresence = { ...message.u, roles: [], ...useUserData(message.u._id) };
	const usernameAndRealNameAreSame = !user.name || user.username === user.name;
	const showUsername = useMessageListShowUsername() && showRealName && !usernameAndRealNameAreSame;

	const showRoles = useMessageListShowRoles();
	const roles = useMessageRoles(message.u._id, message.rid, showRoles);
	const shouldShowRolesList = roles.length > 0;

	return (
		<FuselageMessageHeader>
			<MessageNameContainer>
				<MessageName
					{...(!showUsername && { 'data-qa-type': 'username' })}
					title={!showUsername && !usernameAndRealNameAreSame ? `@${user.username}` : undefined}
					data-username={user.username}
					onClick={user.username !== undefined ? openUserCard(user.username) : undefined}
					style={{ cursor: 'pointer' }}
				>
					{message.alias || getUserDisplayName(user.name, user.username, showRealName)}
				</MessageName>
				{showUsername && (
					<>
						{' '}
						<MessageUsername
							data-username={user.username}
							data-qa-type='username'
							style={{ cursor: 'pointer' }}
							onClick={user.username !== undefined ? openUserCard(user.username) : undefined}
						>
							@{user.username}
						</MessageUsername>
					</>
				)}
			</MessageNameContainer>

			{shouldShowRolesList && <MessageRoles roles={roles} isBot={message.bot} />}
			<MessageTimestamp title={formatters.dateAndTime(message.ts)}>{formatters.time(message.ts)}</MessageTimestamp>
			{message.private && <MessageStatusPrivateIndicator>{t('Only_you_can_see_this_message')}</MessageStatusPrivateIndicator>}
			<StatusIndicators message={message} />
		</FuselageMessageHeader>
	);
};

export default memo(MessageHeader);
