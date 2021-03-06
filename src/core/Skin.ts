/******************************************************************************
 * Spine Runtimes Software License
 * Version 2.5
 *
 * Copyright (c) 2013-2016, Esoteric Software
 * All rights reserved.
 *
 * You are granted a perpetual, non-exclusive, non-sublicensable, and
 * non-transferable license to use, install, execute, and perform the Spine
 * Runtimes software and derivative works solely for personal or internal
 * use. Without the written permission of Esoteric Software (see Section 2 of
 * the Spine Software License Agreement), you may not (a) modify, translate,
 * adapt, or develop new applications using the Spine Runtimes or otherwise
 * create derivative works or improvements of the Spine Runtimes or (b) remove,
 * delete, alter, or obscure any trademarks or any copyright, trademark, patent,
 * or other intellectual property or proprietary rights notices on or in the
 * Software, including any copy thereof. Redistributions in binary or source
 * form must include this license and terms.
 *
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO
 * EVENT SHALL ESOTERIC SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS INTERRUPTION, OR LOSS OF
 * USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
 * IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/

namespace pixi_spine.core {
    export class SkinEntry {
        constructor(public slotIndex: number, public name: string, public attachment: Attachment) { }
    }

    export class Skin {
        name: string;
        attachments = new Array<Map<Attachment>>();
        bones = Array<BoneData>();
        constraints = new Array<ConstraintData>();

        constructor (name: string) {
            if (name == null) throw new Error("name cannot be null.");
            this.name = name;
        }

        setAttachment (slotIndex: number, name: string, attachment: Attachment) {
            if (attachment == null) throw new Error("attachment cannot be null.");
            let attachments = this.attachments;
            if (slotIndex >= attachments.length) attachments.length = slotIndex + 1;
            if (!attachments[slotIndex]) attachments[slotIndex] = { };
            attachments[slotIndex][name] = attachment;
        }

        addSkin (skin: Skin) {
            for(let i = 0; i < skin.bones.length; i++) {
                let bone = skin.bones[i];
                let contained = false;
                for (let j = 0; j < this.bones.length; j++) {
                    if (this.bones[j] == bone) {
                        contained = true;
                        break;
                    }
                }
                if (!contained) this.bones.push(bone);
            }

            for(let i = 0; i < skin.constraints.length; i++) {
                let constraint = skin.constraints[i];
                let contained = false;
                for (let j = 0; j < this.constraints.length; j++) {
                    if (this.constraints[j] == constraint) {
                        contained = true;
                        break;
                    }
                }
                if (!contained) this.constraints.push(constraint);
            }

            let attachments = skin.getAttachments();
            for (let i = 0; i < attachments.length; i++) {
                var attachment = attachments[i];
                this.setAttachment(attachment.slotIndex, attachment.name, attachment.attachment);
            }
        }

        copySkin (skin: Skin) {
            for(let i = 0; i < skin.bones.length; i++) {
                let bone = skin.bones[i];
                let contained = false;
                for (let j = 0; j < this.bones.length; j++) {
                    if (this.bones[j] == bone) {
                        contained = true;
                        break;
                    }
                }
                if (!contained) this.bones.push(bone);
            }

            for(let i = 0; i < skin.constraints.length; i++) {
                let constraint = skin.constraints[i];
                let contained = false;
                for (let j = 0; j < this.constraints.length; j++) {
                    if (this.constraints[j] == constraint) {
                        contained = true;
                        break;
                    }
                }
                if (!contained) this.constraints.push(constraint);
            }

            let attachments = skin.getAttachments();
            for (let i = 0; i < attachments.length; i++) {
                var attachment = attachments[i];
                if (attachment.attachment == null) continue;
                if (attachment.attachment instanceof MeshAttachment) {
                    attachment.attachment = attachment.attachment.newLinkedMesh();
                    this.setAttachment(attachment.slotIndex, attachment.name, attachment.attachment);
                } else {
                    attachment.attachment = attachment.attachment.copy();
                    this.setAttachment(attachment.slotIndex, attachment.name, attachment.attachment);
                }
            }
        }

        /** @return May be null. */
        getAttachment (slotIndex: number, name: string): Attachment {
            let dictionary = this.attachments[slotIndex];
            return dictionary ? dictionary[name] : null;
        }

        removeAttachment (slotIndex: number, name: string) {
            let dictionary = this.attachments[slotIndex];
            if (dictionary) dictionary[name] = null;
        }

        getAttachments (): Array<SkinEntry> {
            let entries = new Array<SkinEntry>();
            for (var i = 0; i < this.attachments.length; i++) {
                let slotAttachments = this.attachments[i];
                if (slotAttachments) {
                    for (let name in slotAttachments) {
                        let attachment = slotAttachments[name];
                        if (attachment) entries.push(new SkinEntry(i, name, attachment));
                    }
                }
            }
            return entries;
        }

        getAttachmentsForSlot (slotIndex: number, attachments: Array<SkinEntry>) {
            let slotAttachments = this.attachments[slotIndex];
            if (slotAttachments) {
                for (let name in slotAttachments) {
                    let attachment = slotAttachments[name];
                    if (attachment) attachments.push(new SkinEntry(slotIndex, name, attachment));
                }
            }
        }

        clear () {
            this.attachments.length = 0;
            this.bones.length = 0;
            this.constraints.length = 0;
        }

        /** Attach each attachment in this skin if the corresponding attachment in the old skin is currently attached. */
        attachAll (skeleton: Skeleton, oldSkin: Skin) {
            let slotIndex = 0;
            for (let i = 0; i < skeleton.slots.length; i++) {
                let slot = skeleton.slots[i];
                let slotAttachment = slot.getAttachment();
                if (slotAttachment && slotIndex < oldSkin.attachments.length) {
                    let dictionary = oldSkin.attachments[slotIndex];
                    for (let key in dictionary) {
                        let skinAttachment:Attachment = dictionary[key];
                        if (slotAttachment == skinAttachment) {
                            let attachment = this.getAttachment(slotIndex, key);
                            if (attachment != null) slot.setAttachment(attachment);
                            break;
                        }
                    }
                }
                slotIndex++;
            }
        }
    }
}
